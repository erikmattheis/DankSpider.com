const openai = require('Openai');

const Openai = new openai(process.env.OPENAI_API_KEY);

async function getOpenAIArticle(topic, length) {
  const messages = [{ role: 'user', content: `Funny and informative ${length} word article about ${topic} for an eigth grader with a good understanding of chemestry. Format for html using H2 for section headers` }];

  const model = "gpt-3.5-turbo";

  const gptResponse = await Openai.chat.completions.create({
    messages,
    model,
  });
  console.log('res', gptResponse.choices[0].message.content)
  return gptResponse.choices[0].message.content;

}

async function getOpenAIDescription(topic) {
  const messages = [{
    role: 'system', content: `Meta descriptions for no longer than 155 characters for page defining cannabis terpene ${topic}`
  }];

  const model = "gpt-3.5-turbo";

  const gptResponse = await Openai.chat.completions.create({
    messages,
    model,
  });

  return gptResponse.choices[0].message.content;

}

async function getOpenAIHeadline(topic) {
  const messages = [{
    role: 'system', content: `A headline with silly puns 10 words or fewer for article on cannabis terpene ${topic}`
  }];

  const model = "gpt-3.5-turbo";

  const gptResponse = await Openai.chat.completions.create({
    messages,
    model,
  });

  return gptResponse.choices[0].message.content;
}

async function getArticle(chemical, length) {
  console.log('article', chemical);
  const article = await getOpenAIArticle(chemical, length);
  console.log('description', chemical);
  const description = await getOpenAIDescription(`terpene ` + chemical);
  console.log('headline', chemical);
  const headline = await getOpenAIHeadline(`terpene ` + chemical);

  return { name: chemical, article, description, headline }
}

module.exports = { getArticle };
