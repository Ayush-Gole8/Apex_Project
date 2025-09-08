#!/usr/bin/env python3
"""
COCOMO Basic Model Estimator
- Computes effort (person-months), schedule (months), team size, and cost based on LOC and project mode.
- Generates a plain-text report for assignments or quick analysis.

Usage examples:
  # Provide LOC explicitly (Rupees by default)
  python e:\\Apex\\cocomo_estimator.py --loc 50000 --mode organic --cost-per-pm 120000

  # Auto-scan project to estimate LOC and auto-select mode
  python e:\\Apex\\cocomo_estimator.py --auto-scan --paths e:\\Apex\\frontend e:\\Apex\\backend --cost-per-pm 100000
"""
import argparse
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
import os
from pathlib import Path


@dataclass(frozen=True)
class CocomoCoefficients:
    a: float
    b: float
    c: float
    d: float


COEFFICIENTS: Dict[str, CocomoCoefficients] = {
    # Basic COCOMO (1981) coefficients
    # Mode descriptions:
    # - organic: small teams, familiar domain, less rigid requirements
    # - semidetached: mixed experience, intermediate complexity
    # - embedded: tight hardware/software/regs constraints, high complexity
    "organic": CocomoCoefficients(a=2.4, b=1.05, c=2.5, d=0.38),
    "semidetached": CocomoCoefficients(a=3.0, b=1.12, c=2.5, d=0.35),
    "embedded": CocomoCoefficients(a=3.6, b=1.20, c=2.5, d=0.32),
}


# -------------------- LOC Scanning Utilities --------------------
COMMENT_PREFIXES = {
    '.js': ['//'],
    '.jsx': ['//'],
    '.ts': ['//'],
    '.tsx': ['//'],
    '.py': ['#'],
    '.java': ['//'],
    '.c': ['//'],
    '.cpp': ['//'],
    '.h': ['//'],
    '.css': ['/*', '//'],
    '.html': ['<!--'],
    '.json': [],
}


def count_effective_lines(file_path: Path) -> int:
    ext = file_path.suffix.lower()
    prefixes = COMMENT_PREFIXES.get(ext, ['//', '#'])
    count = 0
    try:
        with file_path.open('r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                s = line.strip()
                if not s:
                    continue
                if any(s.startswith(p) for p in prefixes):
                    continue
                count += 1
    except Exception:
        # If unreadable, skip
        return 0
    return count


def scan_loc(paths: List[str], include_exts: Optional[List[str]] = None, exclude_dirs: Optional[List[str]] = None):
    include = set(include_exts or [
        '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.json', '.css', '.html'
    ])
    exclude = set(exclude_dirs or [
        'node_modules', 'build', 'dist', '.next', '.git', '.vscode', '__pycache__', '.cache'
    ])

    files: List[Tuple[str, int]] = []
    by_ext: Dict[str, int] = {}
    by_dir: Dict[str, int] = {}

    for p in paths:
        root = Path(p)
        if not root.exists():
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            # prune excluded dirs
            dirnames[:] = [d for d in dirnames if d not in exclude]
            for fn in filenames:
                ext = Path(fn).suffix.lower()
                if ext not in include:
                    continue
                fp = Path(dirpath) / fn
                loc = count_effective_lines(fp)
                if loc <= 0:
                    continue
                files.append((str(fp), loc))
                by_ext[ext] = by_ext.get(ext, 0) + loc
                # aggregate by first-level dir under the provided root
                try:
                    rel = fp.relative_to(root)
                    top = rel.parts[0] if rel.parts else str(root.name)
                except Exception:
                    top = root.name
                by_dir[top] = by_dir.get(top, 0) + loc

    total_loc = sum(l for _, l in files)
    files_sorted = sorted(files, key=lambda x: x[1], reverse=True)

    return {
        'total_loc': total_loc,
        'files_sorted': files_sorted,
        'by_ext': dict(sorted(by_ext.items(), key=lambda x: x[1], reverse=True)),
        'by_dir': dict(sorted(by_dir.items(), key=lambda x: x[1], reverse=True)),
        'file_count': len(files),
        'paths_scanned': [str(Path(p)) for p in paths],
    }


def choose_mode_by_kloc(kloc: float) -> Tuple[str, str]:
    # Basic COCOMO guideline: Organic (<= 50 KLOC), Semi-detached (50-300), Embedded (> 300)
    if kloc <= 50:
        return 'organic', f"Auto-selected 'organic' because KLOC={kloc:.2f} ≤ 50 (small team, familiar domain)."
    if kloc <= 300:
        return 'semidetached', f"Auto-selected 'semidetached' because 50 < KLOC={kloc:.2f} ≤ 300 (mixed experience, moderate complexity)."
    return 'embedded', f"Auto-selected 'embedded' because KLOC={kloc:.2f} > 300 (tight constraints, high complexity)."


# -------------------- COCOMO Core --------------------

def cocomo_basic(loc: float, mode: str, cost_per_pm: float) -> Dict[str, float]:
    if loc <= 0:
        raise ValueError("LOC must be > 0")
    if mode not in COEFFICIENTS:
        raise ValueError(f"Mode must be one of: {', '.join(COEFFICIENTS.keys())}")
    if cost_per_pm <= 0:
        raise ValueError("Cost per person-month must be > 0")

    coeff = COEFFICIENTS[mode]
    kloc = loc / 1000.0

    effort_pm = coeff.a * (kloc ** coeff.b)  # person-months
    schedule_months = coeff.c * (effort_pm ** coeff.d)  # months
    team_size = effort_pm / schedule_months  # persons
    cost_total = effort_pm * cost_per_pm
    productivity_loc_per_pm = loc / effort_pm

    return {
        "kloc": kloc,
        "effort_pm": effort_pm,
        "schedule_months": schedule_months,
        "team_size": team_size,
        "cost_total": cost_total,
        "productivity_loc_per_pm": productivity_loc_per_pm,
    }


def format_report(loc: float, mode: str, cost_per_pm: float, currency: str, results: Dict[str, float], round_to: int, mode_reason: Optional[str] = None, scan_summary: Optional[Dict] = None) -> str:
    r = results
    rt = round_to
    lines: List[str] = []
    lines.append("COCOMO Cost Estimation Report")
    lines.append("=")
    lines.append("")
    lines.append("Inputs")
    lines.append(f"- Estimated LOC: {int(loc):,}")
    lines.append(f"- Project mode: {mode}")
    if mode_reason:
        lines.append(f"  Reason: {mode_reason}")
    lines.append(f"- Cost per person-month: {currency}{round(cost_per_pm, rt):,}")
    lines.append(f"- KLOC: {round(r['kloc'], rt):,}")
    lines.append("")
    lines.append("Model (Basic COCOMO)")
    coeff = COEFFICIENTS[mode]
    lines.append(f"- Effort (PM) = {coeff.a} * (KLOC^{coeff.b})")
    lines.append(f"- Schedule (months) = {coeff.c} * (Effort^{coeff.d})")
    lines.append("")
    lines.append("Estimates")
    lines.append(f"- Effort: {round(r['effort_pm'], rt):,} person-months")
    lines.append(f"- Schedule: {round(r['schedule_months'], rt):,} months")
    lines.append(f"- Avg team size: {round(r['team_size'], rt):,} persons")
    lines.append(f"- Productivity: {round(r['productivity_loc_per_pm'], rt):,} LOC/PM")
    lines.append(f"- Estimated cost: {currency}{round(r['cost_total'], rt):,}")

    if scan_summary:
        lines.append("")
        lines.append("Project Scan Summary")
        lines.append(f"- Paths scanned: {', '.join(scan_summary.get('paths_scanned', []))}")
        lines.append(f"- Files analyzed: {scan_summary.get('file_count', 0):,}")
        lines.append(f"- Estimated LOC from scan: {scan_summary.get('total_loc', 0):,}")
        by_dir = scan_summary.get('by_dir', {})
        if by_dir:
            # show top 3 directories
            top_dirs = list(by_dir.items())[:3]
            for d, v in top_dirs:
                lines.append(f"  · {d}: {v:,} LOC")
        by_ext = scan_summary.get('by_ext', {})
        if by_ext:
            # show top 3 extensions
            top_ext = list(by_ext.items())[:3]
            pretty = ', '.join([f"{k}={v:,}" for k, v in top_ext])
            lines.append(f"- Top languages: {pretty}")
        files_sorted = scan_summary.get('files_sorted', [])
        if files_sorted:
            lines.append("- Largest files:")
            for path, locf in files_sorted[:5]:
                lines.append(f"  · {Path(path).name}: {locf:,} LOC")

    lines.append("")
    lines.append("Notes")
    lines.append("- Basic COCOMO assumes nominal conditions without cost drivers.")
    lines.append("- Choose mode based on size/complexity: organic, semidetached, embedded.")
    lines.append("- Values are indicative; adjust 'cost per PM' to your team's local rates in INR.")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="COCOMO Basic Cost Estimator")
    parser.add_argument("--loc", type=float, required=False, help="Estimated lines of code (LOC). If omitted with --auto-scan, uses scanned LOC")
    parser.add_argument("--mode", type=str, choices=list(COEFFICIENTS.keys()) + ["auto"], default="auto", help="Project mode/size category or 'auto' to pick by KLOC")
    parser.add_argument("--cost-per-pm", dest="cost_per_pm", type=float, default=100000.0, help="Cost per person-month (INR)")
    parser.add_argument("--currency", type=str, default="₹", help="Currency symbol or code (e.g., ₹, INR)")
    parser.add_argument("--report-path", dest="report_path", type=str, default=r"e:\\Apex\\cocomo_report.txt", help="Where to save the generated report")
    parser.add_argument("--round", dest="round_to", type=int, default=2, help="Rounding digits for outputs")
    parser.add_argument("--auto-scan", action="store_true", help="Scan project folders to estimate LOC")
    parser.add_argument("--paths", nargs="*", default=[r"e:\\Apex"], help="Paths to scan when using --auto-scan")

    args = parser.parse_args()

    scan_summary = None
    loc_value: Optional[float] = args.loc

    if args.auto_scan:
        scan_summary = scan_loc(args.paths)
        if loc_value is None:
            loc_value = float(scan_summary.get('total_loc', 0))
    
    if loc_value is None or loc_value <= 0:
        raise SystemExit("Please provide --loc or use --auto-scan to estimate LOC.")

    # Decide mode
    selected_mode = args.mode
    mode_reason = None
    if args.mode == 'auto':
        kloc = loc_value / 1000.0
        selected_mode, mode_reason = choose_mode_by_kloc(kloc)

    results = cocomo_basic(loc=loc_value, mode=selected_mode, cost_per_pm=args.cost_per_pm)
    report = format_report(
        loc=loc_value,
        mode=selected_mode,
        cost_per_pm=args.cost_per_pm,
        currency=args.currency,
        results=results,
        round_to=args.round_to,
        mode_reason=mode_reason,
        scan_summary=scan_summary,
    )

    # Write report
    Path(args.report_path).parent.mkdir(parents=True, exist_ok=True)
    with open(args.report_path, "w", encoding="utf-8") as f:
        f.write(report)

    print("Report generated:", args.report_path)


if __name__ == "__main__":
    main()
