# 像素風闖關問答遊戲 (Pixel Quiz Game)

這是一個具備 2000 年代街機風格的像素風問答遊戲。前端使用 React Vite 建置，後端整合 Google Sheets 與 Google Apps Script (GAS)。

## 🚀 快速開始

### 1. Google Sheets 設定

1. 建立一個新的 Google 試算表。
2. 建立兩個工作表，名稱分別為：
   - **`題目`**
   - **`回答`**
3. 在 **`題目`** 工作表設定以下標題列（第 1 列）：
   `題號` | `題目` | `A` | `B` | `C` | `D` | `解答`
4. 在 **`回答`** 工作表設定以下標題列（第 1 列）：
   `ID` | `闖關次數` | `總分` | `最高分` | `第一次通關分數` | `花了幾次通關` | `最近遊玩時間`

### 2. Google Apps Script 部署

1. 在試算表中點選 `擴充功能` > `Apps Script`。
2. 將專案中的 `gas-backend.js` 內容全部複製並貼上到 `程式碼.gs`。
3. 點選右上角的 `部署` > `新部署`。
4. 設定如下：
   - **類型**：網頁應用程式
   - **執行身分**：我
   - **誰有權存取**：任何人
5. 點選 `部署`，並複製產生的 **網頁應用程式 URL**。

### 3. 前端專案設定

1. 參考 `.env.example` 建立 `.env` 檔案。
2. 將設定填入：
   ```env
   VITE_GOOGLE_APP_SCRIPT_URL=你的_GAS_URL
   VITE_PASS_THRESHOLD=3
   VITE_QUESTION_COUNT=5
   ```
3. 執行安裝與啟動：
   ```bash
   npm install
   npm run dev
   ```

---

## 🌐 自動化部署 (GitHub Pages)

本專案已設定 GitHub Actions，只要推送至 GitHub，即可自動部署：

1.  **設定 GitHub Secrets**：
    在 GitHub Repository 點選 `Settings` > `Secrets and variables` > `Actions`，新增以下三個 Secrets（內容參考 `.env.example`）：
    - `VITE_GOOGLE_APP_SCRIPT_URL`
    - `VITE_PASS_THRESHOLD`
    - `VITE_QUESTION_COUNT`
2.  **開啟 Pages 權限**：
    在 `Settings` > `Pages`，將 **Build and deployment** > **Source** 改為 `GitHub Actions`。
3.  **推送程式碼**：
    只要 `git push` 到 `main` 分支，GitHub 就會自動執行部署流程。

---

## 📚 測試題目：生成式 AI 基礎知識

請將下表內容複製並貼上至 Google 試算表的 **`題目`** 工作表中（第 2 列開始）：

| 題號 | 題目                                                       | A                                  | B                    | C                              | D                    | 解答 |
| :--- | :--------------------------------------------------------- | :--------------------------------- | :------------------- | :----------------------------- | :------------------- | :--- |
| 1    | 生成式 AI 核心技術中，GPT 是什麼的縮寫？                   | Generative Pre-trained Transformer | General Process Tool | Global Pixel Tech              | Great Power Training | A    |
| 2    | 在 LLM 中，用來控制輸出隨機性與創造力的參數通常稱為？      | Speed                              | Temperature          | Volume                         | Brightness           | B    |
| 3    | AI 產生看似正確但完全錯誤的資訊，這種現象稱為？            | Hallucination (幻覺)               | Fog (霧化)           | Glitch (故障)                  | Sleep (睡眠)         | A    |
| 4    | 下列哪一個模型是由 OpenAI 開發的影像生成 AI？              | Midjourney                         | Stable Diffusion     | DALL-E                         | Claude               | C    |
| 5    | 大型語言模型中最基礎的組成單位（單詞片段）稱之為？         | Token                              | Pixel                | Bit                            | Atom                 | A    |
| 6    | 「Prompt Engineering」的主要目的是什麼？                   | 優化伺服器硬體                     | 設計模型架構         | 優化給 AI 的指令以獲得更好結果 | 增加訓練資料量       | C    |
| 7    | 下列哪一家公司開發了名為「Claude」的生成式 AI？            | Google                             | Meta                 | Anthropic                      | Microsoft            | C    |
| 8    | 生成式 AI 與傳統判別式 AI 的主要區別在於？                 | 生成式 AI 能創造新數據             | 生成式 AI 跑得比較快 | 傳統 AI 不需要網路             | 傳統 AI 比較聰明     | A    |
| 9    | 哪種模型架構是目前生成式語言模型的主流？                   | RNN                                | CNN                  | Transformer                    | MLP                  | C    |
| 10   | 在 AI 法律與倫理中，生成內容的版權通常在哪個環節最具爭議？ | 資料訓練來源                       | 輸出速度             | 檔案格式                       | 介面顏色             | A    |

---

## 🎨 美術風格

- **字體**：
  - 中文：思源黑體 (Noto Sans TC)
  - 英文/數字/符號：Times New Roman
- **頭像**：使用 DiceBear API 動態生成的像素頭像。
- **功能特色**：
  - **REVIEW 模式**：結算頁面可查看題目解析與正確答案。
  - **動態評語**：根據得分提供差異化反饋。
  - **自動部署**：整合 GitHub Actions 實現快速建置。
