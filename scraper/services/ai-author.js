const openai = require('openai');

const openai = new openai(process.env.OPENAI_API_KEY);

async function getOpenAIArticle(topic, length) {
  const prompt = [{ role: 'system', content: 'You are a humour author for an eigth grader with a good understanding of chemestry. ' },
  { role: 'user', content: `${length} word article about ${topic}` }];

  const engine = "gpt-3.5-turbo";

  const gptResponse = await openai.chat.completions.create({
    prompt,
    engine,
  });

  return gptResponse.data;

}

async function getOpenAIDescription(topic, length) {
  const prompt = [{ role: 'system', content: 'You write meta descriptions for search engines that are no longer than 155 characters.' },
  { role: 'user', content: `${topic}` }]; of

  const engine = "gpt-3.5-turbo";

  const gptResponse = await openai.chat.completions.create({
    prompt,
    engine,
  });

  return gptResponse.data;

}

async function getOpenAIPageHeadline(topic, length) {
  const prompt = [{ role: 'system', content: 'You write headlines with silly puns 12 words or fewer.' },
  { role: 'user', content: `${topic}` }]; of

  const engine = "gpt-3.5-turbo";

  const gptResponse = await openai.chat.completions.create({
    prompt,
    engine,
  });

  return gptResponse.data;
}

function getArticle(chemical) {
  console.log('article', chemical);
  const article = await getOpenAIArticle(chemical);
  console.log('description', chemical);
  const description = await getOpenAIDescription(`chemical` + chemical);
  console.log('headline', chemical);
  const headline = getOpenAIHeadline(`chemical` + chemical);

  return { chemical, article, description, headline }
}
