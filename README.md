# 这里是说明

一个基于 `Vite + React + TypeScript` 的菜单交互 Demo，用于展示说话人标签菜单的视觉和交互方案。
- React 19
- TypeScript
- Vite

## 本地启动

```bash
npm install
npm run dev
```


## 项目结构

```text
.
├── public/assets/menu/        # 菜单图标与头像资源
├── src/App.tsx                # 主交互与页面结构
├── src/main.tsx               # 应用入口
├── src/styles.css             # 全部样式
├── index.html                 # Vite 页面入口
└── package.json               # 依赖与脚本
```

## 当前交互说明

页面打开后可以直接体验以下交互：

1. 点击任一说话人行，可切换选中状态。
2. hover 某一行后，右侧会显示更多按钮。
3. 点击更多按钮，可打开操作菜单。
4. 选择“合并说话人”后，会进入合并模式。
5. 将其他说话人拖入合并区后，点击“合并”可完成合并。


## 备注

这是一个偏交互原型性质的仓库，重点在 UI 行为表达，不包含后端、持久化和业务数据管理。
