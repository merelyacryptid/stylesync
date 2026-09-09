"""Budget-aware outfit curation for the MVP.

Full PRD scope (CLIP embeddings, visual similarity cross-platform price matching) is deferred.
This module does two things with the seeded catalog:

1. Filters products by required category, size availability, and gender.
2. Solves a 0/1 multiple-choice knapsack (at most one item per category) to maximize a simple
   text-based compatibility score under the project's budget, producing several distinct boards.
"""

import re
from collections import defaultdict

from app.models import Product

# Keep DP tractable: work in whole rupees (or whole units of whatever minor currency uses 100 subunits).
_MINOR_UNITS_PER_MAJOR = 100


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-z]+", text.lower()))


def score_product(product: Product, event_tokens: set[str]) -> float:
    """0-100 heuristic: base score plus occasion/keyword overlap with the event description."""
    occasion_tokens: set[str] = set()
    for occasion in product.occasions:
        occasion_tokens |= _tokenize(occasion)
    overlap = len(occasion_tokens & event_tokens)
    score = 55.0 + min(overlap, 3) * 15.0
    return min(score, 100.0)


def filter_catalog(
    products: list[Product],
    required_categories: list[str],
    sizes: dict[str, str],
    gender: str = "Women",
) -> dict[str, list[Product]]:
    by_category: dict[str, list[Product]] = defaultdict(list)
    for product in products:
        if not product.is_available or product.gender != gender:
            continue
        if required_categories and product.primary_category not in required_categories:
            continue
        wanted_size = sizes.get(product.primary_category)
        if wanted_size and wanted_size not in product.in_stock_sizes:
            continue
        by_category[product.primary_category].append(product)
    return by_category


def _knapsack_single_board(
    by_category: dict[str, list[tuple[Product, float]]],
    budget_minor: int,
    excluded_ids: set[str],
) -> tuple[list[Product], float]:
    """Multiple-choice knapsack: choose 0 or 1 item per category to maximize total score,
    subject to sum(price + shipping) <= budget. DP granularity is whole currency units."""
    capacity = max(budget_minor // _MINOR_UNITS_PER_MAJOR, 0)
    # dp[c] = (best_score, choices) where choices maps category -> Product
    dp: list[tuple[float, dict[str, Product]]] = [(0.0, {}) for _ in range(capacity + 1)]

    for category, items in by_category.items():
        next_dp = [row for row in dp]  # "skip this category" baseline
        for product, score in items:
            if product.product_id in excluded_ids:
                continue
            weight = (product.current_price_minor + product.estimated_shipping_minor) // _MINOR_UNITS_PER_MAJOR
            if weight > capacity:
                continue
            for c in range(capacity, weight - 1, -1):
                candidate_score, candidate_choices = dp[c - weight]
                candidate_score = candidate_score + score
                if candidate_score > next_dp[c][0]:
                    new_choices = dict(candidate_choices)
                    new_choices[category] = product
                    next_dp[c] = (candidate_score, new_choices)
        dp = next_dp

    best_score, best_choices = max(dp, key=lambda row: row[0])
    return list(best_choices.values()), best_score


def generate_boards(
    products: list[Product],
    required_categories: list[str],
    event_description: str | None,
    budget_minor: int,
    sizes: dict[str, str],
    board_count: int = 3,
) -> list[tuple[list[Product], float]]:
    """Returns up to `board_count` distinct (items, compatibility_score) boards, best first."""
    event_tokens = _tokenize(event_description or "")
    by_category = filter_catalog(products, required_categories, sizes)
    scored_by_category = {
        category: [(product, score_product(product, event_tokens)) for product in items]
        for category, items in by_category.items()
    }

    boards: list[tuple[list[Product], float]] = []
    excluded_ids: set[str] = set()
    for _ in range(board_count):
        items, score = _knapsack_single_board(scored_by_category, budget_minor, excluded_ids)
        if not items:
            break
        boards.append((items, round(score, 2)))
        # Force the next board to differ: exclude this board's priciest item so the DP
        # is nudged toward a different combination next round.
        priciest = max(items, key=lambda p: p.current_price_minor)
        excluded_ids.add(priciest.product_id)

    return boards
