function setPropertyDisabled(attributeName, boolValue = true) {
  //недоступне
  var attributeProps = EdocsApi.getControlProperties(attributeName);
  attributeProps.disabled = boolValue;
  EdocsApi.setControlProperties(attributeProps);
}

function onCreate() {
  setContractor();
  EdocsApi.setAttributeValue({ code: "Direction", value: "E-Auction", text: "null" });
}

function onCardInitialize() {
  EdocsApi.setControlProperties({ code: "ContractorRole", hidden: false, disabled: false, required: true });
  EdocsApi.setControlProperties({ code: "Contractor", hidden: false, disabled: false, required: true });
  AuditTask();
}

function AuditTask() {
  var stateTask = EdocsApi.getCaseTaskDataByCode("Audit")?.state;
  if (stateTask == "completed" || stateTask == "rejected") {
    setPropertyDisabled("ContractorRole");
    setPropertyDisabled("Contractor");
  }
}

function onTaskExecuteAudit() {
  setPropertyDisabled("ContractorRole");
  setPropertyDisabled("Contractor");
}

function setContractor() {
  debugger;
  var attr = EdocsApi.getInExtAttributes(CurrentDocument.id.toString())?.tableAttributes;
  if (attr) {
    var EDRPOU = attr.find((x) => x.row == 1 && x.code == "LegalEntityCode")?.value;
    var dataContractor = EdocsApi.getContractorByCode(EDRPOU, "debtor");
    if (dataContractor) {
      EdocsApi.setAttributeValue({ code: "ContractorName", value: dataContractor.shortName, text: null });
      EdocsApi.setAttributeValue({ code: "ContractorID", value: dataContractor.contractorId, text: null });
      EdocsApi.setAttributeValue({ code: "ContractorEDRPOU", value: EDRPOU, text: null });
    }
  }
}

function onTaskExecuteSendOutDoc(routeStage) {
  debugger;
  sendCommand(routeStage);
}

function sendCommand(routeStage) {
  debugger;
  var command;
  var comment;
  if (routeStage.executionResult == "executed") {
    command = "CompleteTask";
  } else {
    command = "RejectTask";
    comment = routeStage.comment;
  }
  var signatures = EdocsApi.getSignaturesAllFiles();
  var DocCommandData = {
    extSysDocID: CurrentDocument.id,
    extSysDocVersion: CurrentDocument.version,
    command: command,
    legalEntityCode: "39484263",
    userTitle: CurrentUser.fullName,
    comment: comment,
    signatures: signatures,
  };

  routeStage.externalAPIExecutingParams = {
    externalSystemCode: "RCESIGN", // код зовнішньої системи
    externalSystemMethod: "integration/processDocCommand", // метод зовнішньої системи
    data: DocCommandData, // дані, що очікує зовнішня система для заданого методу
    executeAsync: false, // виконувати завдання асинхронно
  };
}
