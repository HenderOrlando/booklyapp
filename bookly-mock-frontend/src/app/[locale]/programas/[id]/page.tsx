"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/Tabs";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import { useProgram } from "@/hooks/usePrograms";
import { httpClient } from "@/infrastructure/http";
import { Resource } from "@/types/entities/resource";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import * as React from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  programRole?: string;
  enrollmentDate?: string;
}

interface _ResourceWithPriority extends Resource {
  priority?: number;
}

export default function ProgramaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const t = useTranslations("programs");
  const router = useRouter();

  // React Query para cargar programa
  const { data: program, isLoading: loading } = useProgram(resolvedParams.id);

  // Estados manuales para recursos y usuarios (mantener por ahora)
  const [allResources, setAllResources] = React.useState<Resource[]>([]);
  const [programResources, setProgramResources] = React.useState<Resource[]>(
    [],
  );
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [programUsers, setProgramUsers] = React.useState<User[]>([]);
  const [resourceFilter, setResourceFilter] = React.useState("");
  const [userFilter, setUserFilter] = React.useState("");
  const [isEditingResources, setIsEditingResources] = React.useState(false);
  const [selectedResourceIds, setSelectedResourceIds] = React.useState<
    Set<string>
  >(new Set());

  // Cargar recursos y usuarios (programa viene de useProgram)
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [resourcesRes, programResourcesRes, usersRes, programUsersRes] =
          await Promise.all([
            httpClient.get<{ items?: Resource[] }>("resources"),
            httpClient.get<{ items?: Resource[] }>(`program-resources?programId=${resolvedParams.id}`),
            httpClient.get<{ items?: User[] }>("users"),
            httpClient.get<{ items?: User[] }>(`program-users?programId=${resolvedParams.id}`),
          ]);

        if (resourcesRes.success && resourcesRes.data) {
          setAllResources(resourcesRes.data.items || []);
        }

        if (programResourcesRes.success && programResourcesRes.data) {
          setProgramResources(programResourcesRes.data.items || []);
        }

        if (usersRes.success && usersRes.data) {
          setAllUsers(usersRes.data.items || []);
        }

        if (programUsersRes.success && programUsersRes.data) {
          setProgramUsers(programUsersRes.data.items || []);
        }
      } catch (err: any) {
        console.error("Error loading data:", err);
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  // Inicializar selección cuando se cargan recursos del programa
  React.useEffect(() => {
    const ids = new Set(programResources.map((r) => r.id));
    setSelectedResourceIds(ids);
  }, [programResources]);

  // Usuarios disponibles (no asociados)
  const availableUsers = allUsers.filter(
    (u) => !programUsers.some((pu: any) => pu.id === u.id),
  );

  const filteredAvailableUsers = availableUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(userFilter.toLowerCase()) ||
      u.email?.toLowerCase().includes(userFilter.toLowerCase()),
  );

  // Iniciar modo edición de recursos
  const handleStartEditResources = () => {
    setIsEditingResources(true);
    setResourceFilter("");
  };

  // Cancelar edición de recursos
  const handleCancelEditResources = () => {
    setIsEditingResources(false);
    // Restaurar selección original
    const ids = new Set(programResources.map((r) => r.id));
    setSelectedResourceIds(ids);
    setResourceFilter("");
  };

  // Toggle selección de recurso
  const handleToggleResource = (resourceId: string) => {
    const newSelection = new Set(selectedResourceIds);
    if (newSelection.has(resourceId)) {
      newSelection.delete(resourceId);
    } else {
      newSelection.add(resourceId);
    }
    setSelectedResourceIds(newSelection);
  };

  // Guardar cambios en recursos
  const handleSaveResources = async () => {
    try {
      const currentIds = new Set(programResources.map((r) => r.id));
      const toAdd = Array.from(selectedResourceIds).filter(
        (id) => !currentIds.has(id),
      );
      const toRemove = Array.from(currentIds).filter(
        (id) => !selectedResourceIds.has(id),
      );

      // Agregar nuevos recursos
      for (const resourceId of toAdd) {
        await httpClient.post("program-resources", {
          programId: resolvedParams.id,
          resourceId,
          priority: 3,
        });
      }

      // Quitar recursos
      for (const resourceId of toRemove) {
        await httpClient.delete(
          `program-resources?programId=${resolvedParams.id}&resourceId=${resourceId}`,
        );
      }

      // Actualizar lista de recursos del programa
      const newProgramResources = allResources.filter((r) =>
        selectedResourceIds.has(r.id),
      );
      setProgramResources(newProgramResources);
      setIsEditingResources(false);
      setResourceFilter("");
    } catch (err: any) {
      console.error("Error saving resources:", err);
    }
  };

  // Agregar usuario
  const handleAddUser = async (userId: string, role: string) => {
    try {
      const response = await httpClient.post("program-users", {
        programId: resolvedParams.id,
        userId,
        role,
      });

      if (response.success) {
        const user = allUsers.find((u) => u.id === userId);
        if (user) {
          setProgramUsers([...programUsers, { ...user, programRole: role }]);
        }
      }
    } catch (err: any) {
      console.error("Error adding user:", err);
    }
  };

  // Quitar usuario
  const handleRemoveUser = async (userId: string) => {
    try {
      await httpClient.delete(
        `program-users?programId=${resolvedParams.id}&userId=${userId}`,
      );
      setProgramUsers(programUsers.filter((u: any) => u.id !== userId));
    } catch (err: any) {
      console.error("Error removing user:", err);
    }
  };

  const _header = <AppHeader title={program?.name || t("loading_program")} />;
  const _sidebar = <AppSidebar />;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-500 mx-auto mb-4"></div>
            <p className="text-[var(--color-text-secondary)]">
              {t("loading_program")}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!program) {
    return (
      <MainLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-foreground">{t("not_found")}</p>
            <Button onClick={() => router.push("/programas")} className="mt-4">
              {t("back_list")}
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
              {program.name}
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              {program.code} - {program.faculty}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/programas")}>
            {t("back")}
          </Button>
        </div>

        {/* Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="general">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="general">{t("general_info")}</TabsTrigger>
                <TabsTrigger value="resources">
                  {t("resources_tab")} ({programResources.length})
                </TabsTrigger>
                <TabsTrigger value="users">
                  {t("users_tab")} ({programUsers.length})
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="general">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-tertiary)] mb-1">
                        {t("code")}
                      </label>
                      <p className="text-foreground font-mono">
                        {program.code}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-tertiary)] mb-1">
                        {t("name")}
                      </label>
                      <p className="text-foreground">{program.name}</p>
                    </div>

                    {program.description && (
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-tertiary)] mb-1">
                          {t("description_label")}
                        </label>
                        <p className="text-foreground">{program.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-tertiary)] mb-1">
                          {t("faculty")}
                        </label>
                        <p className="text-foreground">{program.faculty}</p>
                      </div>

                      {program.department && (
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-tertiary)] mb-1">
                            {t("department")}
                          </label>
                          <p className="text-foreground">
                            {program.department}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-tertiary)] mb-1">
                        {t("status")}
                      </label>
                      {program.isActive ? (
                        <Badge variant="success">{t("active")}</Badge>
                      ) : (
                        <Badge variant="secondary">{t("inactive")}</Badge>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="resources">
                  <div className="space-y-4">
                    {!isEditingResources ? (
                      // Modo Ver: Solo recursos asociados
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-foreground">
                            {t("program_resources_title")} (
                            {programResources.length})
                          </h3>
                          <Button onClick={handleStartEditResources}>
                            {t("edit_resources")}
                          </Button>
                        </div>
                        {programResources.length === 0 ? (
                          <p className="text-center text-[var(--color-text-tertiary)] py-8">
                            {t("no_resources_program")}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {programResources.map((resource: any) => (
                              <div
                                key={resource.id}
                                className="flex items-center justify-between p-4 bg-[var(--color-bg-primary)]/50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-foreground">
                                    {resource.name}
                                  </p>
                                  <p className="text-sm text-[var(--color-text-tertiary)]">
                                    {resource.code} - {t("capacity")}:{" "}
                                    {resource.capacity}
                                  </p>
                                </div>
                                <Badge variant="success">
                                  {t("associated")}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      // Modo Editar: Todos los recursos con checkboxes
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-foreground">
                            {t("select_resources")}
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={handleCancelEditResources}
                            >
                              {t("cancel")}
                            </Button>
                            <Button onClick={handleSaveResources}>
                              {t("save_changes")}
                            </Button>
                          </div>
                        </div>

                        <Input
                          placeholder={t("search_resources")}
                          value={resourceFilter}
                          onChange={(e: any) =>
                            setResourceFilter(e.target.value)
                          }
                          className="mb-4"
                        />

                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                          {allResources
                            .filter((r) =>
                              resourceFilter
                                ? r.name
                                    .toLowerCase()
                                    .includes(resourceFilter.toLowerCase()) ||
                                  r.code
                                    .toLowerCase()
                                    .includes(resourceFilter.toLowerCase())
                                : true,
                            )
                            .map((resource) => (
                              <label
                                key={resource.id}
                                className="flex items-center justify-between p-4 bg-[var(--color-bg-primary)]/50 rounded-lg cursor-pointer hover:bg-[var(--color-bg-primary)]"
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedResourceIds.has(
                                      resource.id,
                                    )}
                                    onChange={() =>
                                      handleToggleResource(resource.id)
                                    }
                                    className="w-5 h-5 rounded border-[var(--color-border-strong)] bg-[var(--color-bg-tertiary)] text-brand-primary-500 focus:ring-brand-primary-500 focus:ring-offset-gray-900"
                                  />
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {resource.name}
                                    </p>
                                    <p className="text-sm text-[var(--color-text-tertiary)]">
                                      {resource.code} - {t("type")}:{" "}
                                      {resource.type} -{t("capacity")}:{" "}
                                      {resource.capacity}
                                    </p>
                                  </div>
                                </div>
                              </label>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-strong)]">
                          <p className="text-sm text-[var(--color-text-tertiary)]">
                            {t("selected_resources_count", {
                              count: selectedResourceIds.size,
                            })}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="users">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-4">
                        {t("associated_users_title")}
                      </h3>
                      {programUsers.length === 0 ? (
                        <p className="text-[var(--color-text-tertiary)]">
                          {t("no_users_associated")}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {programUsers.map((user: any) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-4 bg-[var(--color-bg-primary)]/50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-foreground">
                                  {user.name}
                                </p>
                                <p className="text-sm text-[var(--color-text-tertiary)]">
                                  {user.email}
                                </p>
                                {user.programRole && (
                                  <Badge variant="secondary" className="mt-1">
                                    {user.programRole}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveUser(user.id)}
                              >
                                {t("remove")}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-4">
                        {t("add_users_title")}
                      </h3>
                      <Input
                        placeholder={t("search_users")}
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="mb-4"
                      />
                      {filteredAvailableUsers.length === 0 ? (
                        <p className="text-[var(--color-text-tertiary)]">
                          {t("no_users_available")}
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {filteredAvailableUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-4 bg-[var(--color-bg-primary)]/50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-foreground">
                                  {user.name}
                                </p>
                                <p className="text-sm text-[var(--color-text-tertiary)]">
                                  {user.email}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleAddUser(user.id, "STUDENT")
                                  }
                                >
                                  {t("add_student")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleAddUser(user.id, "PROFESSOR")
                                  }
                                >
                                  {t("add_professor")}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
