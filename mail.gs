const ID = {
  DOC_TEMPLE: "1osFrGdM7pK9FyXr4sqGqShjGUI0SUVdb1XecKHRbJ84", //出欠確認ドキュメント
  PDF_OUTDIR: "12JRg0N9UVaIMoVu09WzZy03C2iqWCKW9", //PDF保存先
};

function gasGoogleFormDocument(e) {
  //ドキュメント編集用に作る
  const copyFile = DriveApp.getFileById(ID.DOC_TEMPLE).makeCopy(),
    copyFileId = copyFile.getId(),
    copyDocument = DocumentApp.openById(copyFileId);
  let dockBody = copyDocument.getBody();

  //回答データ取得
  let itemResponces;

  if (e !== undefined) {
    itemResponces = e.response.getItemResponses();
  } else {
    const formResponces = FormApp.getActiveForm().getResponses();
    itemResponces = formResponces[formResponces.length - 1].getItemResponses();
  }

  //回答データ取得し、対象箇所にマッピング
  itemResponces.forEach(function (itemResponce) {
    switch (itemResponce.getItem().getTitle()) {
      case "参加されますか？":
        dockBody = dockBody.replaceText(
          `{{append}}`,
          itemResponce.getResponse(),
        );
        break;

      case "参加者の名前をご記入ください。":
        dockBody = dockBody.replaceText(`{{name}}`, itemResponce.getResponse());
        break;

      case "このイベントのことを、どのようにしてお知りになりましたか。":
        dockBody = dockBody.replaceText(`{{know}}`, itemResponce.getResponse());
        break;

      case "コメントまたはご質問":
        dockBody = dockBody.replaceText(
          `{{reason}}`,
          itemResponce.getResponse(),
        );
        break;

      case "日付を入力してください":
        dockBody = dockBody.replaceText(
          `{{date}}`,
          dayjs.dayjs(itemResponce.getResponse()).format("YYYY/MM/DD"),
        );
        break;
    }
  });
  dockBody = dockBody.replaceText(
    `{{now}}`,
    dayjs.dayjs().format("YYYY年MM月DD日"),
  );
  copyDocument.saveAndClose();

  // PDF変換するためのベースURLと必要なオプションを作成
  let baseUrl = `https://docs.google.com/document/d/${copyFileId}/export?exportFormat=pdf`,
    options = {
      headers: {
        Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
      },
    },
    pdfBlob = UrlFetchApp.fetch(baseUrl, options)
      .getBlob()
      .setName(
        `イベント出欠確認_${dayjs.dayjs().format("YYYY年MM月DD日HH時mm分ss秒")}.pdf`,
      ),
    pdfFile = DriveApp.getFolderById(ID.PDF_OUTDIR).createFile(pdfBlob);
  // pdfファイルができたら元データ（Googleドキュメント）は削除
  copyFile.setTrashed(true);

  //PDFを添付してメール送信
  GmailApp.sendEmail(
    "yum.10xki@gmail.com",
    "【自動送信】イベント出欠確認",
    "利用者より送信されました",
    { attachments: DriveApp.getFileById(pdfFile.getId()).getBlob() },
  );
}
