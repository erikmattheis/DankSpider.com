async parseFile = function () {

  const worker = await createWorker('eng');
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
