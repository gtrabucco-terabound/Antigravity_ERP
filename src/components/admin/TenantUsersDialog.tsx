'use client';

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Users, Mail, User, UserPlus } from "lucide-react";

interface TenantMember {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
}

interface TenantUsersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId?: string;
}

export function TenantUsersDialog({ isOpen, onOpenChange, tenantId }: TenantUsersDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  
  const firestore = useFirestore();

  // Depends on tenantId
  const membersQuery = useMemo(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, '_gl_tenants', tenantId, 'members');
  }, [firestore, tenantId]);

  const { data: members, loading } = useCollection<TenantMember>(membersQuery as any);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting || !firestore || !tenantId) return;

    setIsSubmitting(true);

    try {
      const tempPass = `Tera${Math.floor(1000 + Math.random() * 9000)}!`;
      
      const apiResponse = await fetch('/api/users/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          password: tempPass,
          name: adminName,
          role: 'ADMIN',
          tenantId: tenantId
        })
      });

      if (!apiResponse.ok) {
        const err = await apiResponse.json();
        throw new Error(err.error || 'Error al provisionar en Firebase Auth');
      }

      const { uid } = await apiResponse.json();

      await setDoc(doc(firestore, '_gl_users', uid), {
        email: adminEmail,
        name: adminName,
        status: 'pending_activation',
        createdAt: serverTimestamp(),
        mustChangePassword: true,
        tempPassword: tempPass,
        role: 'admin',
        tenantId: tenantId
      });

      await setDoc(doc(firestore, '_gl_tenants', tenantId, 'members', uid), {
        userId: uid,
        email: adminEmail,
        name: adminName,
        role: 'ADMIN',
        status: 'active',
        joinedAt: serverTimestamp()
      });

      alert(`Usuario creado con éxito.\nAcceso: ${adminEmail}\nClave Temporal: ${tempPass}`);
      setAdminName('');
      setAdminEmail('');
      setShowAddForm(false);
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error al crear usuario.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border shadow-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestionar Usuarios de Empresa
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Ver y añadir administradores u operadores para esta empresa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Usuarios Actuales</h4>
            {!showAddForm && (
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)} className="h-8 text-xs border-primary/20 text-primary hover:bg-primary/10">
                <UserPlus className="h-3 w-3 mr-2" /> Añadir Usuario
              </Button>
            )}
          </div>

          {loading ? (
             <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : members && members.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {members.map(member => (
                <div key={member.id} className="p-3 bg-muted/20 border border-border/50 rounded-lg flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {member.name.substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-foreground">{member.name}</span>
                      <span className="text-[10px] text-muted-foreground">{member.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">{member.role}</span>
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">{member.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">No hay usuarios registrados.</div>
          )}

          {showAddForm && (
            <form onSubmit={handleAddUser} className="mt-4 pt-4 border-t border-border/50 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">Nuevo Usuario Administrador</p>
              <div className="grid gap-2">
                <Label htmlFor="adminName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Nombre Completo</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="adminName" 
                    value={adminName} 
                    onChange={(e) => setAdminName(e.target.value)} 
                    placeholder="Ej. Ana Gómez" 
                    className="pl-10 bg-muted/20 border-border h-11 focus-visible:ring-primary/20" 
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adminEmail" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Email Corporativo</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="adminEmail" 
                    type="email"
                    value={adminEmail} 
                    onChange={(e) => setAdminEmail(e.target.value)} 
                    placeholder="ana@empresa.com" 
                    className="pl-10 bg-muted/20 border-border h-11 focus-visible:ring-primary/20" 
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)} disabled={isSubmitting} className="h-9 text-xs">Cancelar</Button>
                <Button type="submit" className="h-9 text-xs bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                  Crear Usuario
                </Button>
              </div>
            </form>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
