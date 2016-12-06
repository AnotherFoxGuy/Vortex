/**
 * declaration of an attribute of a table
 * 
 * @export
 * @interface IModAttribute
 */
export interface ITableAttribute {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isToggleable: boolean;
  isReadOnly: boolean;
  isSortable: boolean;
  calc: (attributes: any) => any;
  sortFunc?: (lhs: any, rhs: any, locale: string) => number;
  filterFunc?: (filter: string, value: any) => boolean;
}