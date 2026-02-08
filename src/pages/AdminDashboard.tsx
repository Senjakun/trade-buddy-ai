import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Server,
  Wifi,
  WifiOff,
  Loader2,
  Save,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface NodeData {
  id: string;
  label: string;
  persona: string;
  model: string;
  ip: string;
  port: string;
  status: string;
}

interface PingResult {
  reachable: boolean;
  latency?: number;
  models?: string[];
  error?: string;
}

const AdminDashboard = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [authError, setAuthError] = useState("");
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [pingResults, setPingResults] = useState<Record<string, PingResult>>({});
  const [pingingNode, setPingingNode] = useState<string | null>(null);
  const [savingNode, setSavingNode] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { ip: string; port: string }>>({});

  const callAdmin = useCallback(
    async (body: Record<string, unknown>) => {
      const { data, error } = await supabase.functions.invoke("admin-nodes", {
        body,
        headers: { "x-admin-key": adminKey },
      });
      if (error) throw error;
      return data;
    },
    [adminKey]
  );

  const handleLogin = async () => {
    if (!adminKey.trim()) return;
    setLoading(true);
    setAuthError("");
    try {
      const data = await callAdmin({ action: "list" });
      if (data.error === "Unauthorized") {
        setAuthError("Invalid admin key");
        setLoading(false);
        return;
      }
      const nodeList = data.nodes as NodeData[];
      setNodes(nodeList);
      const edits: Record<string, { ip: string; port: string }> = {};
      nodeList.forEach((n) => {
        edits[n.id] = { ip: n.ip, port: n.port };
      });
      setEditValues(edits);
      setAuthenticated(true);
    } catch {
      setAuthError("Failed to authenticate. Check your admin key.");
    }
    setLoading(false);
  };

  const handlePing = async (nodeId: string) => {
    setPingingNode(nodeId);
    try {
      const result = await callAdmin({ action: "ping", nodeId });
      setPingResults((prev) => ({ ...prev, [nodeId]: result as PingResult }));
      // Update node status locally
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? { ...n, status: result.reachable ? "online" : "offline" }
            : n
        )
      );
    } catch {
      setPingResults((prev) => ({
        ...prev,
        [nodeId]: { reachable: false, error: "Request failed" },
      }));
    }
    setPingingNode(null);
  };

  const handleSave = async (nodeId: string) => {
    setSavingNode(nodeId);
    try {
      await callAdmin({
        action: "update",
        nodeId,
        updates: editValues[nodeId],
      });
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, ...editValues[nodeId] } : n
        )
      );
    } catch {
      // silent fail
    }
    setSavingNode(null);
  };

  const statusColor = (status: string) => {
    if (status === "online") return "text-buy bg-buy/10";
    if (status === "degraded") return "text-hold bg-hold/10";
    return "text-sell bg-sell/10";
  };

  // ───── Password Gate ─────
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm void-card rounded-2xl p-8 space-y-6"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Admin Access
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your admin key to manage VPS nodes
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Admin Key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="pl-10 bg-muted/20 border-border/50 font-mono text-sm"
              />
            </div>
            {authError && (
              <p className="text-xs text-sell font-mono">{authError}</p>
            )}
            <Button
              onClick={handleLogin}
              disabled={!adminKey.trim() || loading}
              variant="hero"
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shield className="mr-2 h-4 w-4" />
              )}
              Authenticate
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ───── Admin Panel ─────
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-card/20">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">
                Node Administration
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                /admin-rimba
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAuthenticated(false);
              setAdminKey("");
            }}
            className="font-mono text-xs"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="void-card rounded-xl p-6 space-y-4"
          >
            {/* Node Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    {node.label}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground">
                    Persona: {node.persona} · Model: {node.model}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase ${statusColor(
                  node.status
                )}`}
              >
                {node.status}
              </span>
            </div>

            {/* IP / Port Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                  IP Address
                </label>
                <Input
                  type="text"
                  value={editValues[node.id]?.ip ?? ""}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      [node.id]: { ...prev[node.id], ip: e.target.value },
                    }))
                  }
                  placeholder="123.45.67.89"
                  className="bg-muted/20 border-border/50 font-mono text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                  Port
                </label>
                <Input
                  type="text"
                  value={editValues[node.id]?.port ?? ""}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      [node.id]: { ...prev[node.id], port: e.target.value },
                    }))
                  }
                  className="bg-muted/20 border-border/50 font-mono text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs"
                onClick={() => handleSave(node.id)}
                disabled={savingNode === node.id}
              >
                {savingNode === node.id ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-3 w-3" />
                )}
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs"
                onClick={() => handlePing(node.id)}
                disabled={pingingNode === node.id}
              >
                {pingingNode === node.id ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ) : (
                  <Wifi className="mr-1.5 h-3 w-3" />
                )}
                Ping
              </Button>
            </div>

            {/* Ping Result */}
            <AnimatePresence>
              {pingResults[node.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className={`rounded-lg border p-3 ${
                      pingResults[node.id].reachable
                        ? "border-buy/30 bg-buy/5"
                        : "border-sell/30 bg-sell/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {pingResults[node.id].reachable ? (
                        <CheckCircle2 className="h-4 w-4 text-buy" />
                      ) : (
                        <XCircle className="h-4 w-4 text-sell" />
                      )}
                      <span
                        className={`font-mono text-xs font-bold ${
                          pingResults[node.id].reachable
                            ? "text-buy"
                            : "text-sell"
                        }`}
                      >
                        {pingResults[node.id].reachable
                          ? "REACHABLE"
                          : "UNREACHABLE"}
                      </span>
                      {pingResults[node.id].latency !== undefined && (
                        <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {pingResults[node.id].latency}ms
                        </span>
                      )}
                    </div>
                    {pingResults[node.id].models &&
                      pingResults[node.id].models!.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {pingResults[node.id].models!.map((m) => (
                            <span
                              key={m}
                              className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    {pingResults[node.id].error && (
                      <p className="mt-1 font-mono text-[10px] text-sell/70">
                        {pingResults[node.id].error}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
