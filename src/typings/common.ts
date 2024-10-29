export interface IApartmentChange {
  type: ApartmentChangeTypeEnum,
  item: IApartmentItem,
}

export enum ApartmentChangeTypeEnum {
  ADDED_ITEM = 'ADDED_ITEM',
  REMOVED_ITEM = 'REMOVED_ITEM',
}