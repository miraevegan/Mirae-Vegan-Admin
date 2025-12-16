"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import axios from "axios";
import type { User } from "@/types/user";
import UserDetailsModal from "./UserDetailsModal";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [search, sortBy]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (sortBy !== "recent") params.append("sortBy", sortBy);

      const { data } = await api.get(`/admin/users?${params.toString()}`);
      setUsers(data.users);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch users");
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search)
    );
  }, [users, search]);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-error">{error}</p>;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-brand text-2xl mb-1">Users</h1>
          <p className="text-text-secondary text-sm">
            View and manage registered users
          </p>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-full border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="recent">Most Recent</option>
          <option value="highest-spender">Highest Spender</option>
          <option value="lowest-spender">Lowest Spender</option>
        </select>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search users by name, email or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
      />

      {/* TABLE */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface sticky top-0 z-10">
            <tr className="text-left text-text-secondary">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4 text-right">Orders</th>
              <th className="px-6 py-4 text-right">Total Spent</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-text-secondary"
                >
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-border last:border-none hover:bg-surface-accent/40 transition"
                >
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4 lowercase">{user.email} <span className="ml-2 text-xs px-3 py-1 bg-brand-primary text-background capitalize rounded-full">{user.role}</span></td>
                  <td className="px-6 py-4">{user.phone || "-"}</td>
                  <td className="px-6 py-4 text-right">
                    {/* {user.ordersCount ?? 0} */}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* ₹{user.totalSpent?.toLocaleString() ?? 0} */}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setViewingUserId(user._id)}
                      className="text-brand-primary hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* USER DETAILS MODAL */}
      {viewingUserId && (
        <UserDetailsModal
          id={viewingUserId}
          onClose={() => setViewingUserId(null)}
        />
      )}
    </div>
  );
}
