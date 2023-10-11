/*
const exampleInput = ["4-8-Tetrahydrocannabinol (A-8 THC) 0.0485 0.0728 ND ND",
  "4-9-Tetrahydrocannabinol (A-9 THC) 0.0485 00728 0090 0.903",
  "4-9-Tetrahydrocannabinolic Acid (THCA-A) 0.0485 0.0728 19.856 198.563",
  "A-9-Tetrahydrocannabiphorol (A-9-THCP) 0.0485 0.0728 ND ND",
  "A-9-Tetrahydrocannabivarin (A-9-THCV) 0.0485 0.0728 ND ND",
  "A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA) 0.0485 0.0728 L0Q LOQ",
  "R-A-10-Tetrahydrocannabinol (R-A-10-THC) 0.0485 0.0728 ND ND",
  "-A-10-Tetrahydrocannabinol (S-A-10-THC) 0.0485 0.0728 ND ND",
  "9R-Hexahydrocannabinol (9R-HHC) 0.0485 0.0728 ND ND",
  "95-Hexahydrocannabinol (95-HHC) 0.0485 0.0728 ND ND",
  "Tetrahydrocannabinol Acetate (THCO) 0.0485 0.0728 ND ND",
  "Cannabidivarin (CBDV) 0.0485 0.0728 ND ND",
  "Cannabidivarinic Acid (CBDVA) 0.0485 0.0728 ND ND",
  "Cannabidiol (CBD) 0.0485 0.0728 ND ND",
  "Cannabidiolic Acid (CBDA) 0.0485 00728 ND ND",
  "Cannabigerol (CBG) 0.0204 0.0728 L0Q LOQ",
  "Cannabigerolic Acid (CBGA) 0.0485 0.0728 0.405 4049",
  "Cannabinol (CBN) 0.0485 0.0728 ND ND",
  "Cannabinolic Acid (CBNA) 0.0485 0.0728 ND ND",
  "Cannabichromene (CBC) 0.0485 0.0728 ND ND",
  "Cannabichromenic Acid (CBCA) 0.0485 0.0728 0121 1214",
  "Total 20473 204.729",
  "4-8-Tetrahydrocannabinol (A-8 THC) 0.0503 0.0754 ND ND",
  "4-9-Tetrahydrocannabinol (A-9 THC) 0.0503 00754 0252 2523",
  "4-9-Tetrahydrocannabinolic Acid (THCA-A) 0.0503 0.0754 20227 202271",
  "A-9-Tetrahydrocannabiphorol (A-9-THCP) 0.0503 0.0754 ND ND",
  "A-9-Tetrahydrocannabivarin (A-9-THCV) 0.0503 0.0754 ND ND",
  "A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA) 0.0332 0.0754 L0Q LOQ",
  "R-A-10-Tetrahydrocannabinol (R-A-10-THC) 0.0503 0.0754 ND ND",
  "-A-10-Tetrahydrocannabinol (S-A-10-THC) 0.0503 0.0754 ND ND",
  "9R-Hexahydrocannabinol (9R-HHC) 0.0503 0.0754 ND ND",
  "95-Hexahydrocannabinol (95-HHC) 0.0503 0.0754 ND ND",
  "Tetrahydrocannabinol Acetate (THCO) 0.0503 0.0754 ND ND",
  "Cannabidivarin (CBDV) 0.0503 0.0754 ND ND",
  "Cannabidivarinic Acid (CBDVA) 0.0503 0.0754 ND ND",
  "Cannabidiol (CBD) 0.0503 0.0754 ND ND",
  "Cannabidiolic Acid (CBDA) 0.0503 0.0754 L0Q L0Q",
  "Cannabigerol (CBG) 0.0332 0.0754 L0Q LOQ",
  "Cannabigerolic Acid (CBGA) 0.0503 0.0754 0894 8.935",
  "Cannabinol (CBN) 0.0503 0.0754 ND ND",
  "Cannabinolic Acid (CBNA) 0.0503 0.0754 ND ND",
  "Cannabichromene (CBC) 0.0503 0.0754 ND ND",
  "Cannabichromenic Acid (CBCA) 0.0503 0.0754 0.110 1.095",
  "Total 21482 214824",
  "4-9-Tetrahydrocannabinol (A-9 THC) 0.0485 00728 0.167 1670",
  "4-9-Tetrahydrocannabinolic Acid (THCA-A) 0.0485 0.0728 26127 261.272",
  "A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA) 0.0485 0.0728 0076 0.757",
  "Cannabigerol (CBG) 0.0485 0.0728 ND ND",
  "Cannabigerolic Acid (CBGA) 0.0485 0.0728 0.489 4893",
  "Cannabinolic Acid (CBNA) 0.0320 0.0728 LOQ LOQ",
  "Total 26981 269.806",
  "4-8-Tetrahydrocannabinol (A-8 THC) 0.0493 0.0739 ND ND",
  "4-9-Tetrahydrocannabinol (A-9 THC) 0.0493 0.0739 0.267 2670",
  "4-9-Tetrahydrocannabinolic Acid (THCA-A) 0.0493 0.0739 22.747 227468",
  "A-9-Tetrahydrocannabiphorol (A-9-THCP) 0.0493 0.0739 ND ND",
  "A-9-Tetrahydrocannabivarin (A-9-THCV) 0.0493 0.0739 ND ND",
  "A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA) 0.0493 0.0739 0.119 1192",
  "R-A-10-Tetrahydrocannabinol (R-A-10-THC) 0.0493 0.0739 ND ND",
  "-A-10-Tetrahydrocannabinol (S-A-10-THC) 0.0493 0.0739 ND ND",
  "9R-Hexahydrocannabinol (9R-HHC) 0.0493 0.0739 ND ND",
  "95-Hexahydrocannabinol (95-HHC) 0.0493 0.0739 ND ND",
  "Tetrahydrocannabinol Acetate (THCO) 0.0493 0.0739 ND ND",
  "Cannabidivarin (CBDV) 0.0493 0.0739 ND ND",
  "Cannabidivarinic Acid (CBDVA) 0.0493 0.0739 ND ND",
  "Cannabidiol (CBD) 0.0493 0.0739 ND ND",
  "Cannabidiolic Acid (CBDA) 0.0493 0.0739 LOQ L0Q",
  "Cannabigerol (CBG) 0.0493 0.0739 0170 1.704",
  "Cannabigerolic Acid (CBGA) 0.0493 0.0739 1202 12.020",
  "Cannabinol (CBN) 0.0493 0.0739 ND ND",
  "Cannabinolic Acid (CBNA) 0.0493 0.0739 ND ND",
  "Cannabichromene (CBC) 0.0493 0.0739 ND ND",
  "Cannabichromenic Acid (CBCA) 0.0493 0.0739 LOQ LOQ",
  "Total 24505 245054",
  "4-8-Tetrahydrocannabinol (A-8 THC) 0.0490 0.0735 ND ND",
  "4-9-Tetrahydrocannabinol (A-9 THC) 0.0490 0.0735 0174 1.735",
  "4-9-Tetrahydrocannabinolic Acid (THCA-A) 0.0490 0.0735 24224 242235",
  "A-9-Tetrahydrocannabiphorol (A-9-THCP) 0.0490 0.0735 ND ND",
  "A-9-Tetrahydrocannabivarin (A-9-THCV) 0.0490 0.0735 ND ND",
  "A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA) 0.0490 0.0735 0.083 0.833",
  "R-A-10-Tetrahydrocannabinol (R-A-10-THC) 0.0490 0.0735 ND ND",
  "-A-10-Tetrahydrocannabinol (S-A-10-THC) 0.0490 0.0735 ND ND",
  "9R-Hexahydrocannabinol (9R-HHC) 0.0490 0.0735 ND ND",
  "95-Hexahydrocannabinol (95-HHC) 0.0490 0.0735 ND ND",
  "Tetrahydrocannabinol Acetate (THCO) 0.0490 0.0735 ND ND",
  "Cannabidivarin (CBDV) 0.0490 0.0735 ND ND",
  "Cannabidivarinic Acid (CBDVA) 0.0490 0.0735 ND ND",
  "Cannabidiol (CBD) 0.0490 0.0735 ND ND",
  "Cannabidiolic Acid (CBDA) 0.0353 0.0735 L0Q L0Q",
  "Cannabigerol (CBG) 0.0490 0.0735 0232 2324",
  "Cannabigerolic Acid (CBGA) 0.0490 0.0735 1266 12.657",
  "Cannabinol (CBN) 0.0490 0.0735 ND ND",
  "Cannabinolic Acid (CBNA) 0.0490 0.0735 ND ND",
  "Cannabichromene (CBC) 0.0490 0.0735 ND ND",
  "Cannabichromenic Acid (CBCA) 0.0353 0.0735 LOQ LOQ",
  "Total 25978 259.784",
  "4-8-Tetrahydrocannabinol (A-8 THC) 0.0481 0.0721 ND ND",
  "4-9-Tetrahydrocannabinol (A-9 THC) 0.0481 0.0721 0.105 1.048",
  "4-9-Tetrahydrocannabinolic Acid (THCA-A) 0.0481 0.0721 20673 206.731",
  "A-9-Tetrahydrocannabiphorol (A-9-THCP) 0.0481 0.0721 ND ND",
  "A-9-Tetrahydrocannabivarin (A-9-THCV) 0.0481 0.0721 ND ND",
  "A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA) 0.0481 0.0721 0.105 1048",
  "R-A-10-Tetrahydrocannabinol (R-A-10-THC) 0.0481 0.0721 ND ND",
  "-A-10-Tetrahydrocannabinol (S-A-10-THC) 0.0481 00721 ND ND",
  "9R-Hexahydrocannabinol (9R-HHC) 0.0481 0.0721 ND ND",
  "95-Hexahydrocannabinol (95-HHC) 0.0481 0.0721 ND ND",
  "Tetrahydrocannabinol Acetate (THCO) 0.0481 00721 ND ND",
  "Cannabidivarin (CBDV) 0.0481 0.0721 ND ND",
  "Cannabidivarinic Acid (CBDVA) 0.0481 0.0721 ND ND",
  "Cannabidiol (CBD) 0.0481 0.0721 ND ND",
  "Cannabidiolic Acid (CBDA) 0.0221 00721 L0Q L0Q",
  "Cannabigerol (CBG) 0.0221 0.0721 L0Q LOQ",
  "Cannabigerolic Acid (CBGA) 0.0481 0.0721 0599 5.990",
  "Cannabinol (CBN) 0.0481 0.0721 ND ND",
  "Cannabinolic Acid (CBNA) 0.0481 0.0721 ND ND",
  "Cannabichromene (CBC) 0.0481 0.0721 ND ND",
  "Cannabichromenic Acid (CBCA) 0.0481 0.0721 0.157 1.567",
  "Total 21638 216.384",
  "4-8-Tetrahydrocannabinol (A-8 THC) 0.0488 0.0732 ND ND",
  "4-9-Tetrahydrocannabinol (A-9 THC) 0.0488 0.0732 0.141 1.405",
  "4-9-Tetrahydrocannabinolic Acid (THCA-A) 0.0488 0.0732 22.936 229.356",
  "A-9-Tetrahydrocannabiphorol (A-9-THCP) 0.0488 0.0732 ND ND",
  "A-9-Tetrahydrocannabivarin (A-9-THCV) 0.0488 0.0732 ND ND",
  "A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA) 0.0488 0.0732 L0Q LOQ",
  "R-A-10-Tetrahydrocannabinol (R-A-10-THC) 0.0488 0.0732 ND ND",
  "-A-10-Tetrahydrocannabinol (S-A-10-THC) 0.0488 0.0732 ND ND",
  "9R-Hexahydrocannabinol (9R-HHC) 0.0488 0.0732 ND ND",
  "95-Hexahydrocannabinol (95-HHC) 0.0488 0.0732 ND ND",
  "Tetrahydrocannabinol Acetate (THCO) 0.0488 0.0732 ND ND",
  "Cannabidivarin (CBDV) 0.0488 0.0732 ND ND",
  "Cannabidivarinic Acid (CBDVA) 0.0488 0.0732 ND ND",
  "Cannabidiol (CBD) 0.0488 0.0732 ND ND",
  "Cannabidiolic Acid (CBDA) 0.0234 00732 L0Q L0Q",
  "Cannabigerol (CBG) 0.0234 0.0732 L0Q LOQ",
  "Cannabigerolic Acid (CBGA) 0.0488 0.0732 1367 13.668",
  "Cannabinol (CBN) 0.0488 0.0732 ND ND",
  "Cannabinolic Acid (CBNA) 0.0488 0.0732 ND ND",
  "Cannabichromene (CBC) 0.0488 0.0732 ND ND",
  "Cannabichromenic Acid (CBCA) 0.0488 0.0732 0.180 1.805",
  "Total 24623 246.234",
  "4-8-Tetrahydrocannabinol (A-8 THC) 0.0478 00718 ND ND",
  "4-9-Tetrahydrocannabinol (A-9 THC) 0.0478 00718 0.240 2402",
  "4-9-Tetrahydrocannabinolic Acid (THCA-A) 0.0478 00718 23510 235.100",
  "A-9-Tetrahydrocannabiphorol (A-9-THCP) 0.0478 0.0718 ND ND",
  "A-9-Tetrahydrocannabivarin (A-9-THCV) 0.0478 0.0718 ND ND",
  "A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA) 0.0478 0.0718 ND ND",
  "R-A-10-Tetrahydrocannabinol (R-A-10-THC) 0.0478 0.0718 ND ND",
  "-A-10-Tetrahydrocannabinol (S-A-10-THC) 0.0478 00718 ND ND",
  "9R-Hexahydrocannabinol (9R-HHC) 0.0478 00718 ND ND",
  "95-Hexahydrocannabinol (95-HHC) 0.0478 0.0718 ND ND",
  "Tetrahydrocannabinol Acetate (THCO) 0.0478 00718 ND ND",
  "Cannabidivarin (CBDV) 0.0478 0.0718 ND ND",
  "Cannabidivarinic Acid (CBDVA) 0.0478 0.0718 ND ND",
  "Cannabidiol (CBD) 0.0478 0.0718 ND ND",
  "Cannabidiolic Acid (CBDA) 0.0287 00718 L0Q L0Q",
  "Cannabigerol (CBG) 0.0478 0.0718 L0Q LOQ",
  "Cannabigerolic Acid (CBGA) 0.0478 0.0718 0821 8211",
  "Cannabinol (CBN) 0.0478 0.0718 ND ND",
  "Cannabinolic Acid (CBNA) 0.0287 0.0718 LOQ LOQ",
  "Cannabichromene (CBC) 0.0478 00718 ND ND",
  "Cannabichromenic Acid (CBCA) 0.0478 00718 0.125 1.254",
  "Total 24.697 246.967",
  "4-9-Tetrahydrocannabinol (A-9 THC) 0.0490 0.0735 0.240 2402",
  "4-9-Tetrahydrocannabinolic Acid (THCA-A) 0.0490 0.0735 18.529 185.294",
  "A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA) 0.0490 0.0735 L0Q LOQ",
  "Cannabidiolic Acid (CBDA) 0.0275 00735 L0Q L0Q",
  "Cannabigerol (CBG) 0.0490 0.0735 ND ND",
  "Cannabigerolic Acid (CBGA) 0.0490 0.0735 0.353 3529",
  "Cannabichromenic Acid (CBCA) 0.0490 0.0735 0.485 4853",]

const names = new Set();
exampleInput.forEach(line => {
  const firstWord = line.split(' ')[0];
  const secondWord = line.split(' ')[1]
  if (secondWord === 'Acid') {
    names.add(`${firstWord} Acid`);
  } else {
    names.add(firstWord);
  }
});

const chemicals = Array.from(names);

console.log(JSON.stringify(chemicals, null, 2));
*/

function lineToOutput(line) {

  /* output for each line {name, pct, originalText }

  originalText should be the line from exampleInput,

  pct should be the number after the last space, or 0 if "ND". If it is is not a number, then "Unknown"

  name should be from this list, if it is not here say "Unknown"

  Δ-8-Tetrahydrocannabinol(Δ-8 THC)
  Δ-9-Tetrahydrocannabinol(Δ-9 THC)
  Δ-9-Tetrahydrocannabinic Acid(Δ-9 THC-A)
  Δ-9-Tetrahydrocannabiphorol(Δ-9 THCP)
  Δ-9-Tetrahydrocannabivarin(Δ-9 THCV)
  Δ-9-Tetrahydrocannabivarinic Acid(Δ-9 THCVA)
  R-Δ-10-Tetrahydrocannabinol(R-Δ-10 THC)
  S-Δ-10-Tetrahydrocannabinol(S-Δ-10 THC)
  9S Hexahydrocannabinol(9R-HHC)
  9S Hexahydrocannabinol(9S-HHC)
  Tetrahydrocannabinol Acetate(THCO)
  Cannabidivarin(CBDV)
  Cannabidivarintic Acid(CBDVA)
  Cannabidiol(CBD)
  Cannabidiolic Acid(CBDA)
  Cannabigerol(CBG)
  Cannabigerolic Acid(CBGA)
  Cannabinol(CBN)
  Cannabinolic Acid(CBNA)
  Cannabichrome(CBC)
  Cannabichromenic Acid(CBCA)


  */

  const parts = line.split(' ');
  const lastPart = parts[parts.length - 1];
  const pct = lastPart === 'ND' ? 0 : (parseFloat(lastPart) / 10).toFixed(2);
  const name = parts.slice(0, parts.length - 1).join(' ');
  const normalizedName = normalizeCannabinoid(name);
  const originalText = line;

  return { name, pct, originalText };
}

const spellings = {
  "4-8-Tetrahydrocannabinol": "Δ-8-Tetrahydrocannabinol",
  "4-9-Tetrahydrocannabinol": "Δ-9-Tetrahydrocannabinol",
  "4-9-Tetrahydrocannabinolic Acid": "Δ-9-Tetrahydrocannabinic Acid",
  "A-9-Tetrahydrocannabiphorol": "Δ-9-Tetrahydrocannabiphorol",
  "A-9-Tetrahydrocannabivarin": "Δ-9-Tetrahydrocannabivarin",
  "A-9-Tetrahydrocannabivarinic Acid": "Δ-9-Tetrahydrocannabivarinic Acid",
  "R-A-10-Tetrahydrocannabinol": "R-Δ-10-Tetrahydrocannabinol",
  "-A-10-Tetrahydrocannabinol": "S-Δ-10-Tetrahydrocannabinol",
  "9R-Hexahydrocannabinol": "9S Hexahydrocannabinol",
  "95-Hexahydrocannabinol": "9S Hexahydrocannabinol",
  "Tetrahydrocannabinol": "Tetrahydrocannabinol Acetate",
  "Cannabidivarin": "Cannabidivarin",
  "Cannabidivarinic Acid": "Cannabidivarintic Acid",
  "Cannabidiol": "Cannabidiol",
  "Cannabidiolic Acid": "Cannabidiolic Acid",
  "Cannabigerol": "Cannabigerol",
  "Cannabigerolic Acid": "Cannabigerolic Acid",
  "Cannabinol": "Cannabinol",
  "Cannabinolic Acid": "Cannabinolic Acid",
  "Cannabichromene": "Cannabichrome",
  "Cannabichromenic Acid": "Cannabichromenic Acid",
}

function normalizeCannabinoid(name) {

  if (spellings[name]) {
    return spellings[name];
  }

  return "Unknown";
}

module.exports = {
  normalizeCannabinoid
}