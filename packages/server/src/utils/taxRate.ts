/**
 * Get inclusive tax amount.
 * @param {number} amount
 * @param {number} taxRate
 * @returns {number}
 */
export const getInclusiveTaxAmount = (amount: number, taxRate: number) => {
  console.log("this is type of tax",typeof taxRate)
  console.log("this is  tax", taxRate)
  if(typeof taxRate === 'string')
  {
    taxRate = Number(taxRate);
  }
  console.log("this is type of tax",typeof taxRate)
  console.log("this is  tax", taxRate)
  return (amount * taxRate) / (100 + taxRate);
};

/**
 * Get exclusive tax amount.
 * @param {number} amount
 * @param {number} taxRate
 * @returns {number}
 */
export const getExlusiveTaxAmount = (amount: number, taxRate: number) => {
  return (amount * taxRate) / 100;
};
