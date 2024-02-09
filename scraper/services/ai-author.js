const openai = require('Openai');
const logger = require('../services/logger.js');

const Openai = new openai(process.env.OPENAI_API_KEY);

async function getOpenAIArticle(topic, length) {
  const messages = [{ role: 'user', content: `Funny and informative ${length} word article about cannabis topics ${topic} for an eigth grade reading level. Format in HTML using p tags and H2 for section headers` }];

  const model = "gpt-3.5-turbo";

  const gptResponse = await Openai.chat.completions.create({
    messages,
    model,
  });

  return gptResponse.choices[0].message.content;

}

async function getOpenAIDescription(topic) {
  const messages = [{
    role: 'system', content: `Meta descriptions for no longer than 155 characters for page defining cannabis topic ${topic}`
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
    role: 'system', content: `Silly headline 10 words or fewer for cannabis story ${topic}`
  }];

  const model = "gpt-3.5-turbo";

  const gptResponse = await Openai.chat.completions.create({
    messages,
    model,
  });

  return gptResponse.choices[0].message.content;
}

async function getArticle(chemical, length) {

  logger.log({
    level: 'info',
    message: `article: ${chemical}`
  });

  const article = await getOpenAIArticle(chemical, length);

  const description = await getOpenAIDescription(`terpene ` + chemical);


  return { name: chemical, article, description, headline }
}

module.exports = { getArticle };
