'use client';

import { ChevronDown } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { useOnChange } from 'fumadocs-core/utils/use-on-change';
import { cn } from '@/utils/cn';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { BaseLinkItem, ButtonItem, type LinkItemType } from '@/layouts/links';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cva } from 'class-variance-authority';
import type { PageTree } from 'fumadocs-core/server';
import type { SidebarComponents } from '@/layouts/docs';
import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  SidebarSeparator,
} from '@/layouts/docs/sidebar';
import { useTreeContext } from '@/contexts/tree';

const itemVariants = cva(
  'flex flex-row items-center gap-2 rounded-md px-3 py-2.5 text-fd-muted-foreground transition-colors duration-100 [overflow-wrap:anywhere] hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none md:px-2 md:py-1.5 [&_svg]:size-4',
);

interface LinksMenuProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  items: LinkItemType[];
}

export function LinksMenu({ items, ...props }: LinksMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useOnChange(pathname, () => {
    setOpen(false);
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger {...props} />
      <PopoverContent className="flex flex-col p-1">
        {items?.map((item, i) => <MenuItem key={i} item={item} />)}
      </PopoverContent>
    </Popover>
  );
}

interface MenuItemProps extends HTMLAttributes<HTMLElement> {
  item: LinkItemType;
}

export function MenuItem({ item, ...props }: MenuItemProps) {
  if (item.type === 'custom')
    return (
      <div {...props} className={cn('grid', props.className)}>
        {item.children}
      </div>
    );

  if (item.type === 'menu') {
    return (
      <Collapsible className="flex flex-col">
        <CollapsibleTrigger
          {...props}
          className={cn(itemVariants(), 'group/link', props.className)}
        >
          {item.icon}
          {item.text}
          <ChevronDown className="ms-auto transition-transform group-data-[state=closed]/link:-rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col py-2 ps-2">
            {item.items.map((child, i) => (
              <MenuItem key={i} item={child} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  if (item.type === 'button') {
    return <ButtonItem item={item} {...props} />;
  }

  return (
    <BaseLinkItem
      item={item}
      {...props}
      className={cn(itemVariants(), props.className)}
    >
      {item.icon}
      {item.text}
    </BaseLinkItem>
  );
}

export function SidebarItems() {
  const { root } = useTreeContext();

  return (
    <div className="px-3 py-4">{renderSidebarList(root.children, 1, {})}</div>
  );
}

function renderSidebarList(
  items: PageTree.Node[],
  level: number,
  customComps: Partial<SidebarComponents>,
): ReactNode[] {
  const { Separator, Item, Folder } = customComps;

  return items.map((item, i) => {
    const id = `${item.type}_${i.toString()}`;

    switch (item.type) {
      case 'separator':
        return Separator ? (
          <Separator key={id} item={item} />
        ) : (
          <SidebarSeparator key={id}>{item.name}</SidebarSeparator>
        );
      case 'folder':
        return Folder ? (
          <Folder key={id} item={item} level={level + 1} />
        ) : (
          <SidebarFolder key={id} item={item} level={level + 1}>
            {item.index ? (
              <SidebarFolderLink
                href={item.index.url}
                external={item.index.external}
              >
                {item.icon}
                {item.name}
              </SidebarFolderLink>
            ) : (
              <SidebarFolderTrigger>
                {item.icon}
                {item.name}
              </SidebarFolderTrigger>
            )}
            <SidebarFolderContent>
              {renderSidebarList(item.children, level + 1, customComps)}
            </SidebarFolderContent>
          </SidebarFolder>
        );
      default:
        return Item ? (
          <Item key={item.url} item={item} />
        ) : (
          <SidebarItem
            key={item.url}
            href={item.url}
            external={item.external}
            icon={item.icon}
          >
            {item.name}
          </SidebarItem>
        );
    }
  });
}
