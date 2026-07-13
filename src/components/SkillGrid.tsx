"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, Plus, Play, Upload, Puzzle, Layers, ChevronDown, Check } from "lucide-react";
import { WorkspaceSkill } from "@/types/skills";
import { useSkills } from "./skills/SkillsProvider";
import { useDialogEscape } from "@/lib/use-dialog";

interface SkillGridProps {
  skills: WorkspaceSkill[];
  onCreateSkill: () => void;
  onImportSkill: () => void;
  onConfigureSkill: (skill: WorkspaceSkill) => void;
  onToast: (message: string, type?: "success" | "error" | "info") => void;
}

type StatusFilter = "all" | "active" | "disabled" | "preview";

/** Searchable multi-select category filter (dropdown pattern referenced from ClawHub). */
function CategoryFilter({
  categories,
  selected,
  onChange,
}: {
  categories: { name: string; count: number }[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useDialogEscape(() => setOpen(false), open);

  const visible = categories.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const label =
    selected.size === 0
      ? "All categories"
      : selected.size === 1
      ? [...selected][0]
      : `${selected.size} categories`;

  return (
    <div className="relative ml-auto">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
          selected.size > 0
            ? "border-[#f5c45e]/50 bg-[#1c1507]/40 text-[#f5c45e]"
            : "border-[#3d3d40] bg-[#151515] text-[#f5f5f5] hover:border-[#626266]"
        }`}
      >
        <Layers className="h-3.5 w-3.5" />
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            role="listbox"
            aria-label="Filter by category"
            className="absolute right-0 top-11 z-40 w-[280px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#303036] bg-[#0b0b0c] shadow-2xl"
          >
            <div className="border-b border-[#222226] p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#85858e]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search categories..."
                  autoFocus
                  className="h-8 w-full rounded-lg border border-[#303036] bg-[#101010] pl-8 pr-3 text-[12px] text-[#f5f5f5] outline-none placeholder:text-[#85858e] focus:border-[#5a5a5e]"
                />
              </div>
            </div>
            <div className="max-h-[280px] overflow-y-auto p-1.5">
              <button
                onClick={() => {
                  onChange(new Set());
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
                  selected.size === 0
                    ? "bg-[#1a1a1e] text-[#f5f5f5]"
                    : "text-[#a7a7ad] hover:bg-[#151519]"
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    selected.size === 0
                      ? "border-[#f5c45e] bg-[#f5c45e]/20 text-[#f5c45e]"
                      : "border-[#3d3d40]"
                  }`}
                >
                  {selected.size === 0 && <Check className="h-3 w-3" />}
                </span>
                <Layers className="h-3.5 w-3.5 text-[#85858e]" />
                All categories
              </button>
              {visible.map((c) => {
                const isSelected = selected.has(c.name);
                return (
                  <button
                    key={c.name}
                    onClick={() => {
                      const next = new Set(selected);
                      if (isSelected) next.delete(c.name);
                      else next.add(c.name);
                      onChange(next);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
                      isSelected ? "text-[#f5f5f5]" : "text-[#a7a7ad] hover:bg-[#151519]"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        isSelected
                          ? "border-[#f5c45e] bg-[#f5c45e]/20 text-[#f5c45e]"
                          : "border-[#3d3d40]"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </span>
                    <span className="flex-1 text-left">{c.name}</span>
                    <span className="text-[11px] text-[#85858e]">{c.count}</span>
                  </button>
                );
              })}
              {visible.length === 0 && (
                <p className="px-3 py-4 text-center text-[12px] text-[#85858e]">
                  No matching categories
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SkillCard({
  skill,
  onConfigure,
  onToast,
}: {
  skill: WorkspaceSkill;
  onConfigure: (skill: WorkspaceSkill) => void;
  onToast: SkillGridProps["onToast"];
}) {
  const router = useRouter();
  const { toggleSkillDisabled } = useSkills();
  const isPreview = skill.status === "preview";

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={() => router.push(`/skill/${skill.id}`)}
      className="group relative rounded-xl border border-[#303036] bg-[#0b0b0c] p-4 transition-colors hover:border-[#3d3d40] cursor-pointer"
    >
      {/* Status dot: Active / Disabled / Preview */}
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
              {skill.disabled ? "Disabled" : "Active"}
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

      {/* Footer: actions only */}
      <div className="mt-3 flex items-center justify-between">
        {/* Enable/disable switch (non-preview skills) */}
        {!isPreview ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSkillDisabled(skill.id);
              onToast(
                skill.disabled ? `${skill.name} enabled` : `${skill.name} disabled`,
                "success"
              );
            }}
            title={skill.disabled ? "Enable skill" : "Disable skill"}
            aria-label={skill.disabled ? `Enable ${skill.name}` : `Disable ${skill.name}`}
            className="flex items-center"
          >
            <span
              className={`flex h-[16px] w-[28px] items-center rounded-full p-[2px] transition-colors ${
                skill.disabled ? "bg-[#303036]" : "bg-[#4ade80]"
              }`}
            >
              <span
                className={`h-3 w-3 rounded-full bg-[#f5f5f5] transition-transform ${
                  skill.disabled ? "" : "translate-x-3"
                }`}
              />
            </span>
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/session/new?skill=${encodeURIComponent(skill.id)}`);
            }}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-[#f5c45e] hover:underline"
          >
            <Play className="h-2.5 w-2.5" />
            Test
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfigure(skill);
            }}
            className="text-[10px] font-medium text-[#85858e] hover:text-[#f5f5f5] transition-colors"
          >
            Configure
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function SkillGrid({ skills, onCreateSkill, onImportSkill, onConfigureSkill, onToast }: SkillGridProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of skills) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [skills]);

  const filteredSkills = useMemo(() => {
    let result = skills;

    if (selectedCategories.size > 0) {
      result = result.filter((s) => selectedCategories.has(s.category));
    }

    if (statusFilter !== "all") {
      result = result.filter((s) => {
        if (statusFilter === "preview") return s.status === "preview";
        if (s.status === "preview") return false;
        return statusFilter === "active" ? !s.disabled : s.disabled;
      });
    }

    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [skills, searchQuery, statusFilter, selectedCategories]);

  const previewCount = skills.filter((s) => s.status === "preview").length;
  const activeCount = skills.filter((s) => s.status !== "preview" && !s.disabled).length;
  const disabledCount = skills.filter((s) => s.status !== "preview" && s.disabled).length;

  const hasActiveFilters =
    statusFilter !== "all" || selectedCategories.size > 0 || searchQuery.trim() !== "";

  const clearFilters = () => {
    setStatusFilter("all");
    setSelectedCategories(new Set());
    setSearchQuery("");
  };

  const statusChip = (value: StatusFilter, label: string, activeClasses: string) => (
    <button
      onClick={() => setStatusFilter(value)}
      className={`h-7 rounded-full px-3 text-[11px] font-medium transition-colors ${
        statusFilter === value ? activeClasses : "text-[#85858e] hover:text-[#f5f5f5]"
      }`}
    >
      {label}
    </button>
  );

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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statusChip("all", `All (${skills.length})`, "bg-[#303036] text-[#f5f5f5]")}
          {statusChip("active", `Active (${activeCount})`, "bg-[#4ade80]/15 text-[#4ade80]")}
          {statusChip("disabled", `Disabled (${disabledCount})`, "bg-[#85858e]/15 text-[#85858e]")}
          {statusChip("preview", `Preview (${previewCount})`, "bg-[#f5c45e]/15 text-[#f5c45e]")}

          <CategoryFilter
            categories={categories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>
      </div>

      {/* Grid */}
      {filteredSkills.length === 0 ? (
        <div className="rounded-xl border border-[#333333] bg-[#181818] px-5 py-12 text-center">
          <Puzzle className="mx-auto mb-3 h-5 w-5 text-[#696969]" />
          <p className="text-sm text-[#85858e]">No skills match your filters.</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-[#f5c45e] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onConfigure={onConfigureSkill}
              onToast={onToast}
            />
          ))}
        </div>
      )}
    </div>
  );
}
