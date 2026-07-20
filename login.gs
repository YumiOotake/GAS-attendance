const URL = {
  WEBAPP: PropertiesService.getScriptProperties().getProperty("URL_WEBAPP"),
};

function doGet(e) {
  let indexHtml = HtmlService.createTemplateFromFile("login");

  indexHtml.loginId = "";

  return indexHtml
    .evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function doPost(e) {
  let indexHtml;

  const userValus = SpreadsheetApp.openById(
    "1YmT7RxvZcAx8EoY3q4knMWvYesXJFUCpOrcFdi0isK4",
  )
    .getSheets()[0]
    .getDataRange()
    .getValues();
  userValus.shift();

  userValus.some(function (user) {
    if (user[0] == e.parameter.loginId && user[2] == e.parameter.password) {
      indexHtml = HtmlService.createTemplateFromFile("index");
      indexHtml.name = user[1];
      return true;
    }
  });

  if (indexHtml === undefined) {
    indexHtml = HtmlService.createTemplateFromFile("login");
    indexHtml.loginId = e.parameter.loginId;
  }

  return indexHtml.evaluate();
}
