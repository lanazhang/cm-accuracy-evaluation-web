export const getFieldOnChange =
  (fieldType, fieldKey, onChangeFn) =>
  ({ detail: { selectedOption, value } }) =>
    onChangeFn({
      [fieldKey]: fieldType === 'select' ? selectedOption : value,
    });