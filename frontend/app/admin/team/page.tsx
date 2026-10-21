"use client";
import { notify } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Users, Plus, Shield, Check, X, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function TeamManagementPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EDITOR');
  const [permissions, setPermissions] = useState<string[]>(['edit_content']);

  const availablePermissions = [
    { key: 'edit_content', name: 'Create/Edit Content' },
    { key: 'delete_content', name: 'Delete Content' },
    { key: 'manage_team', name: 'Manage Team Members' }
  ];

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/team`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMembers(data.data || []);
      }
    } catch (err) {
      console.error(err);
      notify("Unable to update the team. Check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingMember(null);
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('EDITOR');
    setPermissions(['edit_content']);
    setShowModal(true);
  };

  const handleOpenEdit = (member: any) => {
    setEditingMember(member);
    setName(member.name);
    setUsername(member.username);
    setEmail(member.email);
    setPassword(''); // leave blank
    setRole(member.role);
    setPermissions(member.permissions || []);
    setShowModal(true);
  };

  const togglePermission = (perm: string) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter(p => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('admin_token');
      const isEditing = !!editingMember;
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/team/${editingMember._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/team`;
      
      const payload: any = {
        name,
        username,
        email,
        role,
        permissions
      };
      
      if (!isEditing) {
        payload.password = password;
      }

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        notify("Team member saved successfully.", "success");
        setShowModal(false);
        fetchTeam();
      } else {
        const errData = await res.json();
        notify(errData.message || 'Action failed');
      }
    } catch (err) {
      console.error(err);
      notify("Unable to update the team. Check your connection and try again.", "error");
    }
  };

  const handleDelete = async (id: string, memberName: string) => {
    if (!confirm(`Are you sure you want to delete ${memberName}?`)) return;
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        notify("Team member deleted successfully.", "success");
        fetchTeam();
      } else {
        const errData = await res.json();
        notify(errData.message || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      notify("Unable to update the team. Check your connection and try again.", "error");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <Users className="w-8 h-8 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
            <p className="text-xs text-gray-500">Manage roles, permissions, and audit staff logs.</p>
          </div>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-xs transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading team members...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map(member => (
                <tr key={member._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                        {member.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-xs font-semibold text-gray-900">{member.name}</div>
                        <div className="text-xs text-gray-500">@{member.username} • {member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      member.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-700 border border-red-100' :
                      member.role === 'MODERATOR' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {member.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {member.role === 'SUPER_ADMIN' ? (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">All Permissions</span>
                      ) : (
                        member.permissions?.map((p: string) => (
                          <span key={p} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs border border-gray-100">
                            {p.replace('_', ' ')}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link 
                        href={`/admin/team/${member._id}/activity`}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        title="View Change Logs"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleOpenEdit(member)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Edit Role & Permissions"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(member._id, member.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remove Team Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{editingMember ? 'Edit Team Member' : 'Invite Team Member'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500" 
                  placeholder="e.g. Faizan Ahmad"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Username</label>
                  <input 
                    type="text" 
                    required 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    className="w-full px-4 py-2 border rounded-xl text-xs" 
                    placeholder="faizan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full px-4 py-2 border rounded-xl text-xs" 
                    placeholder="admin@mobilerates.info"
                  />
                </div>
              </div>

              {!editingMember && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Password</label>
                  <input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full px-4 py-2 border rounded-xl text-xs" 
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">System Role</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-xl text-xs"
                >
                  <option value="EDITOR">Editor (Can edit/draft mobile pages)</option>
                  <option value="MODERATOR">Moderator (Can review & approve changes)</option>
                  <option value="SUPER_ADMIN">Super Admin (All permissions & Team settings)</option>
                </select>
              </div>

              {role !== 'SUPER_ADMIN' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Granular Permissions</label>
                  <div className="space-y-2">
                    {availablePermissions.map(perm => (
                      <label key={perm.key} className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={permissions.includes(perm.key)} 
                          onChange={() => togglePermission(perm.key)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{perm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  {editingMember ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
