const configMapping = [
  {
    titleKeywords: ['hemp'],
    configs: [{
      urlKeywords: [''],
      name: "ACS_CANNABINOID",
      rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
    }]
  },
  {
    titleKeywords: ['consolidated'],
    configs: [{
      urlKeywords: ['cannabinoid'],
      name: "CANNALYZE_CANNABINOID",
      rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
    },
    {
      urlKeywords: ['terpene'],
      name: "CANNALYZE_TERPENE",
      rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
    }]
  },
  {
    titleKeywords: ['certificate'],
    configs: [{
      urlKeywords: ['potency'],
      name: "NEWBLOOM_CANNABINOIDS",
      rectangle: { top: 2471, left: 202, width: 3094, height: 1744 }
    },
    {
      urlKeywords: ['cannabinoid'],
      name: "NEWBLOOM_CANNABINOIDS",
      rectangle: { top: 2471, left: 202, width: 3094, height: 1744 }
    },
    {
      urlKeywords: ['terpene'],
      name: "NEWBLOOM_TERPENES",
      rectangle: { top: 1265, left: 252, width: 420, height: 420 }
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

async function getConfig(text, url) {
  if (!text) {
    return null;
  }

  for (const entry of configMapping) {
    if (entry.titleKeywords.some(word => text.toLowerCase().includes(word) || word === '')) {
      for (const config of entry.configs) {
        if (config.urlKeywords.some(word => url.toLowerCase().includes(word) || word === '')) {
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