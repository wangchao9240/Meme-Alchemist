#!/bin/bash

echo "════════════════════════════════════════════════════════"
echo "  测试真实热榜抓取（20个话题）"
echo "════════════════════════════════════════════════════════"
echo ""

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查 Backend 是否运行
if ! curl -s http://localhost:8787/ > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend 未运行！${NC}"
    echo "请先运行: cd backend && pnpm dev"
    exit 1
fi

echo -e "${GREEN}✓ Backend 正在运行${NC}"
echo ""

# Step 1: 触发刷新
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: 触发热榜刷新（抓取 Reddit 数据）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

REFRESH_RESULT=$(curl -s -X POST http://localhost:8787/api/trends/refresh \
  -H "X-Admin-Key: dev-secret")

echo "$REFRESH_RESULT" | jq '.'

TOPICS_COUNT=$(echo "$REFRESH_RESULT" | jq -r '.topics_count')

if [ "$TOPICS_COUNT" = "20" ]; then
    echo -e "\n${GREEN}✓ 刷新成功！聚类了 $TOPICS_COUNT 个话题${NC}"
else
    echo -e "\n${YELLOW}⚠️  刷新返回了 $TOPICS_COUNT 个话题${NC}"
fi

sleep 2

# Step 2: 查询缓存的数据
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: 查询热榜 API（应该返回 20 个）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

API_RESULT=$(curl -s "http://localhost:8787/api/trends?date=today&limit=20")
RETURNED_COUNT=$(echo "$API_RESULT" | jq '.topics | length')

echo "返回的话题数量: $RETURNED_COUNT"
echo ""

if [ "$RETURNED_COUNT" = "20" ]; then
    echo -e "${GREEN}✅ 成功！返回了 $RETURNED_COUNT 个话题${NC}"
    echo ""
    echo "前 5 个话题:"
    echo "$API_RESULT" | jq -r '.topics[0:5] | .[] | "  • \(.label) (得分: \(.score))"'
else
    echo -e "${YELLOW}⚠️  只返回了 $RETURNED_COUNT 个话题（预期 20 个）${NC}"
    echo ""
    if [ "$RETURNED_COUNT" = "6" ]; then
        echo "可能的原因:"
        echo "1. KV 缓存未启用（检查 wrangler.toml）"
        echo "2. Backend 需要重启以加载新的 KV 配置"
        echo ""
        echo "解决方法:"
        echo "1. 停止 Backend (Ctrl+C)"
        echo "2. 重新运行: cd backend && pnpm dev"
        echo "3. 再次运行此脚本"
    fi
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "  测试完成"
echo "════════════════════════════════════════════════════════"

