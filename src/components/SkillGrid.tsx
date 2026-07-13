"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, Plus, FileText, Zap, Wrench, Upload, Library, Puzzle } from "lucide-react";
import { WorkspaceSkill } from "@/types/skills";

interface SkillGridProps {
  installedSkills: WorkspaceSkill[];
  librarySkills: WorkspaceSkill[];
  onCreateSkill: () => void;
  onImportSkill: () => void;
}

type TabId = "installed" | "library";
type StatusFilter = "all" | "active" | "inactive" | "preview";

function SkillCard({
  skill,
  isLibrary,
}: {
  skill: WorkspaceSkill;
  isLibrary?: boolean;
}) {
  const router = useRouter();
  const isPreview = skill.status === "preview";
  const toolIcons = [
    skill.hasScripts && <Wrench key="scripts" className="h-3 w-3 text-[#85858e]" />,
    skill.hasReferences && <FileText key="refs" className="h-3 w-3 text-[#85858e]" />,
    skill.hasAssets && <Zap key="assets" className="h-3 w-3 text-[#85858e]" />,
  ].filter(Boolean);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={() => router.push(`/skill/${skill.id}`)}
      className="group relative rounded-xl border border-[#303036] bg-[#0b0b0c] p-4 transition-colors hover:border-[#3d3d40] cursor-pointer"
    >
      {/* Status dot */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {isPreview ? (
          <>
            <div className="h-1.5 w-1.5 rounded-full bg-[#f5c45e]" />
            <span className="text-[10px] font-medium text-[#f5c45e]">Preview</span>
          </>
        ) : (
          <>
            <div className={`h-1.5 w-1.5 rounded-full ${skill.disabled ? "bg-[#85858e]" : "bg-[#4ade80]"}`} />
            <span className={`text-[10px] font-medium ${skill.disabled ? "text-[#85858e]" : "text-[#4ade80]"}`}>
              {skill.disabled ? "Inactive" : "Active"}
            </span>
          </>
        )}
      </div>

      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#303036] bg-[#151519]">
          <span className="text-[16px] leading-none">{skill.emoji || "🔧"}</span>
        </div>
        <div className="min-w-0 flex-1 pr-16">
          <div className="text-sm font-medium text-[#f5f5f5]">{skill.name}</div>
          <div className="text-xs text-[#85858e] mt-0.5 line-clamp-2">{skill.description}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {toolIcons.length > 0 ? toolIcons : <span className="text-[10px] text-[#85858e]">Instruction-only</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#85858e] bg-[#151519] px-1.5 py-0.5 rounded">
            {skill.category}
          </span>
          {isPreview ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/session/new?skill=${encodeURIComponent(skill.id)}`);
              }}
              className="text-[10px] font-medium text-[#f5c45e] hover:underline"
            >
              Try it →
            </button>
          ) : isLibrary ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/session/new?skill=${encodeURIComponent(skill.id)}`);
              }}
              className="text-[10px] font-medium text-[#f5c45e] hover:underline"
            >
              Try with Nova
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/skill/${skill.id}`);
              }}
              className="text-[10px] font-medium text-[#85858e] hover:text-[#f5f5f5] transition-colors"
            >
              Configure
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function SkillGrid({ installedSkills, librarySkills, onCreateSkill, onImportSkill }: SkillGridProps) {
  const [activeTab, setActiveTab] = useState<TabId>("installed");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const currentSkills = activeTab === "installed" ? installedSkills : librarySkills;

  const filteredSkills = useMemo(() => {
    let skills = currentSkills;

    // Apply status filter for installed tab
    if (activeTab === "installed" && statusFilter !== "all") {
      skills = skills.filter((s) => {
        if (statusFilter === "preview") return s.status === "preview";
        if (s.status === "preview") return false;
        return statusFilter === "active" ? !s.disabled : s.disabled;
      });
    }

    if (!searchQuery.trim()) return skills;
    const q = searchQuery.toLowerCase();
    return skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [currentSkills, searchQuery, activeTab, statusFilter]);

  const previewCount = installedSkills.filter((s) => s.status === "preview").length;
  const activeCount = installedSkills.filter((s) => s.status !== "preview" && !s.disabled).length;
  const inactiveCount = installedSkills.filter((s) => s.status !== "preview" && s.disabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#f5f5f5]">Skills</h1>
            <p className="text-sm text-[#85858e] mt-1">
              Skills are instruction packs that teach your agent how and when to use tools.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onImportSkill}
              className="inline-flex items-center gap-2 rounded-lg border border-[#303036] bg-[#151519] px-4 py-2 text-sm font-medium text-[#f5f5f5] transition-colors hover:border-[#5a5a5e] hover:bg-[#1a1a1e]"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={onCreateSkill}
              className="inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-2 text-sm font-medium text-[#111111] transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create Skill
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#85858e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            className="h-10 w-full rounded-lg border border-[#303036] bg-[#101010] pl-10 pr-4 text-sm text-[#f5f5f5] outline-none placeholder:text-[#85858e] focus:border-[#5a5a5e]"
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("installed")}
            className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors ${
              activeTab === "installed"
                ? "border-[#f5f5f5] bg-[#f5f5f5] text-[#111111]"
                : "border-[#3d3d40] bg-[#151515] text-[#f5f5f5] hover:border-[#626266]"
            }`}
          >
            Installed ({installedSkills.length})
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors ${
              activeTab === "library"
                ? "border-[#f5f5f5] bg-[#f5f5f5] text-[#111111]"
                : "border-[#3d3d40] bg-[#151515] text-[#f5f5f5] hover:border-[#626266]"
            }`}
          >
            <Library className="h-3.5 w-3.5 inline mr-1.5" />
            Library ({librarySkills.length})
          </button>

          {/* Status filters for installed tab */}
          {activeTab === "installed" && (
            <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-[#303036]">
              <button
                onClick={() => setStatusFilter("all")}
                className={`h-7 rounded-full px-3 text-[11px] font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-[#303036] text-[#f5f5f5]"
                    : "text-[#85858e] hover:text-[#f5f5f5]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`h-7 rounded-full px-3 text-[11px] font-medium transition-colors ${
                  statusFilter === "active"
                    ? "bg-[#4ade80]/15 text-[#4ade80]"
                    : "text-[#85858e] hover:text-[#f5f5f5]"
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`h-7 rounded-full px-3 text-[11px] font-medium transition-colors ${
                  statusFilter === "inactive"
                    ? "bg-[#85858e]/15 text-[#85858e]"
                    : "text-[#85858e] hover:text-[#f5f5f5]"
                }`}
              >
                Inactive ({inactiveCount})
              </button>
              <button
                onClick={() => setStatusFilter("preview")}
                className={`h-7 rounded-full px-3 text-[11px] font-medium transition-colors ${
                  statusFilter === "preview"
                    ? "bg-[#f5c45e]/15 text-[#f5c45e]"
                    : "text-[#85858e] hover:text-[#f5f5f5]"
                }`}
              >
                Preview ({previewCount})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredSkills.length === 0 ? (
        <div className="rounded-xl border border-[#333333] bg-[#181818] px-5 py-12 text-center">
          <Puzzle className="mx-auto mb-3 h-5 w-5 text-[#696969]" />
          <p className="text-sm text-[#85858e]">
            {activeTab === "installed"
              ? "No skills match your filters."
              : "Library is empty. Import or create skills to share across agents."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              isLibrary={activeTab === "library"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
