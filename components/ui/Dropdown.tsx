import { View, Text } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';
import React from 'react';

export const Dropdown = () => {
  return (
    <View>
      <Text>Dropdown</Text>
    </View>
  );
};

export const DropdownMenuRoot = DropdownMenu.Root;
export const DropdownMenuTrigger = DropdownMenu.Trigger;
export const DropdownMenuContent = DropdownMenu.Content;
export const DropdownMenuItem = DropdownMenu.Item;
export const DropdownMenuItemTitle = DropdownMenu.ItemTitle;

export default Dropdown;
