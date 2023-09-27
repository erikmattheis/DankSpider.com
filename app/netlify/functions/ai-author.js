const OpenAI = require('openai-api');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

async function getOpenAIArticle() {
  // Use Axios to get article from the OpenAI API
  // Return the article
  const prompt = "50 word article about cannabis strains for anxiety";
  const engine = "davinci";
  const maxTokens = 500;
  const temperature = 0.9;
  const topP = 1;
  const frequencyPenalty = 0.5;
  const presencePenalty = 0.0;
  const stop = ["\n", " Human:", " AI:"];
  const stream = false;
  const bestOf = 1;
  const n = 1;
  const logprobs = null;
  const echo = false;
  const stopSequences = null;
  const presencePenalties = null;
  const frequencyPenalties = null;
  const logitBias = null;




  const gptResponse = await openai.complete({
    prompt,
    engine,
    maxTokens,
    temperature,
    topP,
    frequencyPenalty,
    presencePenalty,
    stop,
    stream,
    bestOf,
    n,
    logprobs,
    echo,
    stopSequences,
    presencePenalties,
    frequencyPenalties,
    logitBias,
    logprobs,
  });
  console.log('gptResponse', gptResponse);



}

getOpenAIArticle();
