// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { FormGroup, Button, Intent } from '@blueprintjs/core';
import { MoneyInputGroup } from '@/components';
import { CellType } from '@/constants';


const DiscountTypeCell = ({
  cell: { value: initialValue},
  row: { index ,original},
  column: { id },
  payload: { errors, updateData,currencyCode },
}) => {
  const [value, setValue] = useState(initialValue);
  const [isPercent, setIsPercent] = useState(true);
  const handleBlurChange = (newValue,discountType) => {
    const parsedValue = newValue === '' || newValue === undefined
      ? '' : parseInt(newValue, 10); 
    updateData(index, id, parsedValue);
  }
  const handleBlurChangeForButton = (index, id) => {
    const parsedValue = isPercent === '' || isPercent === undefined || isPercent == 1
      ? 'percentage' : 'amount'; 
    updateData(index, id, parsedValue); 
  } 

  const handleChange = useCallback((value) => {
    setValue(value);
  }, [setValue]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (original.discount_type === 'percentage') {
      setIsPercent(true);
    } else if (original.discount_type === 'amount') {
      setIsPercent(false);
    }
  }, [original.discount_type]);
  
  useEffect(() => {
    handleBlurChangeForButton(index, 'discount_type'); 
}, [isPercent]); 

  const error = errors?.[index]?.[id];

  const toggleInputType = () => {
    setIsPercent((prevState) => {return !prevState;})
  };
  
  return (
    <FormGroup intent={error ? Intent.DANGER : null}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          small
          minimal
          onClick={toggleInputType}
          // on={ ()=>handleBlurChangeForButton(index, 'discount_type', isPercent)}
          className="m-r-10"
        >
          {isPercent ? '%' : currencyCode}
        </Button>

        {isPercent ? (
          <MoneyInputGroup
            prefix={'%'}
            value={value}
            onChange={handleChange}
            onBlurValue={handleBlurChange}
          />
        ) : (
          <MoneyInputGroup
            prefix={currencyCode}
            value={value}
            onChange={handleChange}
            onBlurValue={handleBlurChange}
            placeholder=""
          />
        )}
      </div>
    </FormGroup>
  );
};

DiscountTypeCell.cellType = CellType.Field;

export default DiscountTypeCell;

