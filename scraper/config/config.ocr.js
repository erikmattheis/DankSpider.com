const configMapping = [
  {
    titleKeywords: ['consolidated'],
    configs: [{
      urlKeywords: ['terpene'],
      name: "CANNALYZE_TERPENE",
      rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
    },
    {
      urlKeywords: ['cannabinoid'],
      name: "CANNALYZE_CANNABINOID",
      rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
    },]
  },
  {
    titleKeywords: ['hemp'],
    configs: [{
      urlKeywords: ['terpene'],
      name: "ACS_TERPENE",
      rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
    },
    {
      urlKeywords: [''],
      name: "ACS_CANNABINOID",
      rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
    }]
  },

  {
    titleKeywords: ['certificate'],
    configs: [{
      urlKeywords: ['terpene'],
      name: "NEWBLOOM_TERPENES",
      rectangle: { top: 1265, left: 252, width: 420, height: 420 }
    },
    {
      urlKeywords: [''],
      name: "NEWBLOOM_CANNABINOIDS",
      rectangle: { top: 2471, left: 202, width: 3094, height: 1744 }
    },

    ]
  },
  {
    titleKeywords: [''],
    name: "OTHER_WITH_STRING_IN_URL",
    configs: [{
      urlKeywords: ['terpene'],
      config: {
        rectangle: { top: 1265, left: 252, width: 420, height: 420 }
      },
    },
    {
      urlKeywords: ['cannabinoid'],
      config: {
        rectangle: { top: 1265, left: 252, width: 420, height: 420 }
      }
    }]
  },
  {
    titleKeywords: [''],
    name: "OTHER",
    configs: [
      {
        urlKeywords: [''],
        rectangle: { top: 1756, left: 108, width: 3181, height: 1556 }
      },
    ]
  }
]

const fs = require('fs')

async function getConfig(text, url) {

  fs.appendFileSync('./temp/config.txt', `__________________________\n${url}\n${text}\n________________________________\n\n`)

  if (!text) {
    fs.appendFileSync('./temp/config.txt', `${url}\nno text\n\n`)
    return null;
  }
  console.log()
  for (entry of configMapping) {
    console.log(entry.titleKeywords, entry.titleKeywords.some(word => text.toLowerCase().includes(word) || word === ''))
    if (entry.titleKeywords.some(word => text.toLowerCase().includes(word) || word === '')) {
      console.log('found BANG', entry.titleKeywords)
      for (config of entry.configs) {
        console.log(config.urlKeywords, config.urlKeywords.some(word => url.toLowerCase().includes(word) || word === ''))
        if (config.urlKeywords.some(word => url.toLowerCase().includes(word) || word === '')) {
          console.log('found BOOM', config.urlKeywords)
          return config
        }
      }
    }

    const configCannalyzeCannabinoidsTitle = {
      rectangle: { top: 170, left: 1923, width: 1852, height: 460 }
    }

    const configCannalyzeCannabinoids = {
      //rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
    }


    const configWNCTerpenes = {
      rectangle: { top: 1722, left: 320, width: 1939, height: 1361 }
    }

    const configWNCCannabinoids = {
      rectangle: { top: 2471, left: 202, width: 3094, height: 1744 }
    }

    const configWNCCannabinoids2 = {
      rectangle: { top: 1756, left: 108, width: 3181, height: 1556 }
    }

    const config = {
      rectangle: { top: 1521, left: 234, width: 3369, height: 2263 }
    }

    return null;

  }
}

module.exports = {
  getConfig
}