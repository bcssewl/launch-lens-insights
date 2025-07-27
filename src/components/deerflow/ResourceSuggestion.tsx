import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Mention from '@tiptap/extension-mention';
import tippy, { Instance as TippyInstance } from 'tippy.js';

import { ResourceMentions, ResourceMentionsRef } from './ResourceMentions';

export interface ResourceSuggestionOptions {
  onSearch: (query: string) => Promise<Array<{
    id: string;
    title: string;
    url?: string;
    type: 'document' | 'search_result' | 'citation';
  }>>;
}

export const ResourceSuggestion = Extension.create<ResourceSuggestionOptions>({
  name: 'resourceSuggestion',

  addExtensions() {
    return [
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: async ({ query }) => {
            if (!this.options.onSearch) {
              return [];
            }
            return await this.options.onSearch(query);
          },

          render: () => {
            let component: ReactRenderer<ResourceMentionsRef>;
            let popup: TippyInstance[];

            return {
              onStart: (props) => {
                component = new ReactRenderer(ResourceMentions, {
                  props,
                  editor: props.editor,
                });

                if (!props.clientRect) {
                  return;
                }

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                  zIndex: 9999,
                });
              },

              onUpdate(props) {
                component.updateProps(props);

                if (!props.clientRect) {
                  return;
                }

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                });
              },

              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  popup[0].hide();
                  return true;
                }

                return component.ref?.onKeyDown(props) ?? false;
              },

              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }),
    ];
  },
});