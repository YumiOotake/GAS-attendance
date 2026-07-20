const URL = {
  WEBAPP: PropertiesService.getScriptProperties().getProperty("URL_WEBAPP"),
};

function doGet() {
  let indexHtml = HtmlService.createTemplateFromFile("index");

  return indexHtml
    .evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function clockIn() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("attendance");
  const values = sheet.getDataRange().getValues();
  const now = new Date();

  const alreadyClockedIn = values.some((row) => {
    const type = row[0];
    const date = row[1];
    return type === "clock_in" && isSameDay(date, now);
  });

  if (alreadyClockedIn) {
    return { ok: false, message: "今日はすでに出勤済みです" };
  }

  return recordAttendance("clock_in");
}

function clockOut() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("attendance");
  const values = sheet.getDataRange().getValues();
  const now = new Date();

  const hasClockInToday = values.some((row) => {
    const type = row[0];
    const date = row[1];
    return type === "clock_in" && isSameDay(date, now);
  });

  if (hasClockInToday) {
    return { ok: false, message: "今日はまだ出勤していません" };
  }

  const alreadyClockedIn = values.some((row) => {
    const type = row[0];
    const date = row[1];
    return type === "clock_out" && isSameDay(date, now);
  });

  if (alreadyClockedIn) {
    return { ok: false, message: "今日はすでに退勤済みです" };
  }
  return recordAttendance("clock_out");
}

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function recordAttendance(type) {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("attendance");
  const now = new Date();

  sheet.appendRow([type, now]);
  return { ok: true };
}
