/**
 * Google Apps Script for Quiz Game
 * 
 * Target Sheets:
 * - "題目": 題號, 題目, A, B, C, D, 解答
 * - "回答": ID, 闖關次數, 總分, 最高分, 第一次通關分數, 花了幾次通關, 最近遊玩時間
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const QUESTION_SHEET_NAME = "題目";
const ANSWER_SHEET_NAME = "回答";

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // Fallback if getActiveSpreadsheet() is null
    const spreadsheet = ss || SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
    
    // Handle Answer Submission via GET
    if (e.parameter.action === 'submit') {
      const payload = JSON.parse(e.parameter.data);
      const userId = String(payload.userId || "").trim();
      const userAnswers = payload.answers || [];
      const passThreshold = Number(payload.passThreshold || 0);
      const totalQuestions = Number(payload.totalQuestions || userAnswers.length);
      
      const qSheet = spreadsheet.getSheetByName(QUESTION_SHEET_NAME);
      const aSheet = spreadsheet.getSheetByName(ANSWER_SHEET_NAME);
      
      if (!qSheet || !aSheet) {
        throw new Error("工作表名稱錯誤：請確保名稱為 '題目' 與 '回答'");
      }
      
      const qData = qSheet.getDataRange().getValues();
      qData.shift(); // Remove header row
      
      const answerMap = {};
      qData.forEach(row => {
        if (row[0] !== "" && row[0] !== undefined) {
          const id = String(row[0]).trim();
          const ans = String(row[6] || "").trim();
          answerMap[id] = ans;
        }
      });
      
      let score = 0;
      let debugLog = [];
      userAnswers.forEach(ua => {
        const qId = String(ua.id).trim();
        const uAns = String(ua.answer).trim();
        const correctAns = answerMap[qId];
        const isCorrect = correctAns === uAns;
        if (isCorrect) score++;
        debugLog.push(`${qId}:${uAns} vs ${correctAns} -> ${isCorrect}`);
      });
      
      const passed = score >= passThreshold;
      
      // Try updating stats, but don't let it crash the score return
      try {
        updateUserStats(aSheet, userId, score, totalQuestions, passed);
      } catch (statsErr) {
        console.error("Stats update failed: " + statsErr);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        score: score,
        passed: passed,
        status: "success",
        passThreshold: passThreshold,
        correctAnswers: answerMap, // Send map of id -> answer
        log: debugLog.join(" | ")
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Handle Question Fetching
    const qSheet = spreadsheet.getSheetByName(QUESTION_SHEET_NAME);
    if (!qSheet) throw new Error("找不到工作表 '題目'");
    
    const qData = qSheet.getDataRange().getValues();
    qData.shift(); 
    
    // Filter out rows where ID/Question is empty
    const cleanData = qData.filter(row => row[0] !== "" && row[1] !== "");
    const questionCount = parseInt(e.parameter.count || 10);
    
    const shuffled = cleanData.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, questionCount).map(row => ({
      id: String(row[0]).trim(),
      question: row[1],
      options: { A: row[2], B: row[3], C: row[4], D: row[5] }
    }));

    return ContentService.createTextOutput(JSON.stringify(selected))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString(),
      score: 0, // Fallback for UI
      passed: false,
      passThreshold: 0
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function updateUserStats(sheet, userId, score, totalQuestions, passed) {
  const data = sheet.getDataRange().getValues();
  const userIdIdx = 0;
  
  let userRowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][userIdIdx]).trim() === String(userId).trim()) {
      userRowIdx = i + 1; 
      break;
    }
  }
  
  const now = new Date().toLocaleString();
  
  if (userRowIdx === -1) {
    const firstPassScore = passed ? score : "";
    const attemptsToPass = passed ? 1 : "";
    sheet.appendRow([userId, 1, score, score, firstPassScore, attemptsToPass, now]);
  } else {
    const currentData = data[userRowIdx - 1];
    const attempts = parseInt(currentData[1] || 0) + 1;
    const totalScore = parseInt(currentData[2] || 0) + score;
    const maxScore = Math.max(parseInt(currentData[3] || 0), score);
    
    sheet.getRange(userRowIdx, 2).setValue(attempts); 
    sheet.getRange(userRowIdx, 3).setValue(totalScore); 
    sheet.getRange(userRowIdx, 4).setValue(maxScore); 
    sheet.getRange(userRowIdx, 7).setValue(now); 
    
    const existingFirstPassScore = String(currentData[4] || "").trim();
    if (passed && existingFirstPassScore === "") {
      sheet.getRange(userRowIdx, 5).setValue(score); 
      sheet.getRange(userRowIdx, 6).setValue(attempts); 
    }
  }
}
