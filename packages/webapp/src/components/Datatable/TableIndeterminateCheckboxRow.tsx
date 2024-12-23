// @ts-nocheck
import React from 'react';
import { Checkbox } from '@blueprintjs/core';
import { CellType } from '@/constants';
export default function TableIndeterminateCheckboxRow({
  row,
  onCheckboxClick,
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    if(onCheckboxClick && row.original)
    onCheckboxClick(row.original);
  };
  return (
    <div class="selection-checkbox">
      <Checkbox {...row.getToggleRowSelectedProps()} onClick={handleClick} />
    </div>
  );
}
 
TableIndeterminateCheckboxRow.cellType = CellType.Field;