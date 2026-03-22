import { createClient, isSupabaseEnabled } from "@/lib/supabase/server";
import { encryptApiKey, decryptApiKey } from "../encrypt";
import type { MCPServerConfig, UserMCPConfig } from "./types";

// In-memory storage for demo/non-Supabase mode
let demoMCPConfig: UserMCPConfig = { servers: [] };

/**
 * Get all MCP server configs for a user.
 * Auth tokens are decrypted before returning.
 */
export async function getUserMCPServers(userId: string): Promise<MCPServerConfig[]> {
  if (!isSupabaseEnabled()) {
    return demoMCPConfig.servers;
  }

  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("users")
    .select("mcp_servers")
    .eq("id", userId)
    .single();

  if (!data?.mcp_servers) return [];

  try {
    // mcp_servers is stored as encrypted JSON string
    const decrypted = decryptApiKey(data.mcp_servers);
    const config: UserMCPConfig = JSON.parse(decrypted);
    return config.servers || [];
  } catch {
    return [];
  }
}

/**
 * Save all MCP server configs for a user.
 * The entire config is encrypted as a single blob.
 */
export async function saveUserMCPServers(userId: string, servers: MCPServerConfig[]): Promise<boolean> {
  const config: UserMCPConfig = { servers };

  if (!isSupabaseEnabled()) {
    demoMCPConfig = config;
    return true;
  }

  const supabase = await createClient();
  if (!supabase) return false;

  try {
    const encrypted = encryptApiKey(JSON.stringify(config));
    const { error } = await supabase
      .from("users")
      .update({ mcp_servers: encrypted })
      .eq("id", userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Add a new MCP server config for a user.
 */
export async function addMCPServer(userId: string, server: MCPServerConfig): Promise<boolean> {
  const servers = await getUserMCPServers(userId);

  // Prevent duplicates by ID
  if (servers.some(s => s.id === server.id)) return false;

  // Limit total servers per user (safety)
  if (servers.length >= 20) return false;

  servers.push(server);
  return saveUserMCPServers(userId, servers);
}

/**
 * Update an existing MCP server config.
 */
export async function updateMCPServer(userId: string, serverId: string, updates: Partial<MCPServerConfig>): Promise<boolean> {
  const servers = await getUserMCPServers(userId);
  const index = servers.findIndex(s => s.id === serverId);
  if (index === -1) return false;

  // Don't allow changing the ID
  const { id: _id, ...safeUpdates } = updates;
  servers[index] = { ...servers[index], ...safeUpdates };
  return saveUserMCPServers(userId, servers);
}

/**
 * Delete an MCP server config.
 */
export async function deleteMCPServer(userId: string, serverId: string): Promise<boolean> {
  const servers = await getUserMCPServers(userId);
  const filtered = servers.filter(s => s.id !== serverId);
  if (filtered.length === servers.length) return false; // Not found
  return saveUserMCPServers(userId, filtered);
}
