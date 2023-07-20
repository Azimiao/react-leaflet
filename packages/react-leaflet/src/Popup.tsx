import {
  type EventedProps,
  type LeafletContextInterface,
  type LeafletElement,
  type SetOpenFunc,
  createElementObject,
  createOverlayComponent,
} from '@react-leaflet/core'
import {
  type LatLngExpression,
  Popup as LeafletPopup,
  type PopupEvent,
  type PopupOptions,
} from 'leaflet'
import { type ReactNode, useEffect, useRef, useLayoutEffect } from 'react'

export interface PopupProps extends PopupOptions, EventedProps {
  children?: ReactNode
  position?: LatLngExpression
}

export const Popup = createOverlayComponent<LeafletPopup, PopupProps>(
  function createPopup(props, context) {
    const popup = new LeafletPopup(props, context.overlayContainer)
    return createElementObject(popup, context)
  },
  function usePopupLifecycle(
    element: LeafletElement<LeafletPopup>,
    context: LeafletContextInterface,
    { position, minWidth, maxWidth, maxHeight },
    setOpen: SetOpenFunc,
  ) {
    useEffect(
      function addPopup() {
        const { instance } = element

        function onPopupOpen(event: PopupEvent) {
          if (event.popup === instance) {
            instance.update()
            setOpen(true)
          }
        }

        function onPopupClose(event: PopupEvent) {
          if (event.popup === instance) {
            setOpen(false)
          }
        }

        context.map.on({
          popupopen: onPopupOpen,
          popupclose: onPopupClose,
        })

        if (context.overlayContainer == null) {
          // Attach to a Map
          if (position != null) {
            instance.setLatLng(position)
          }
          instance.openOn(context.map)
        } else {
          // Attach to container component
          context.overlayContainer.bindPopup(instance)
        }

        return function removePopup() {
          context.map.off({
            popupopen: onPopupOpen,
            popupclose: onPopupClose,
          })
          context.overlayContainer?.unbindPopup()
          context.map.removeLayer(instance)
        }
      },
      [element, context, setOpen, position],
    )

    const firstUpdate = useRef(true)
    useLayoutEffect(() => {
      if (firstUpdate.current) {
        firstUpdate.current = false
        return
      }
      const { instance } = element
      if (minWidth != null) {
        instance.options.minWidth = minWidth
      }
      if (maxWidth != null) {
        instance.options.maxWidth = maxWidth
      }
      if (maxHeight != null) {
        instance.options.maxHeight = maxHeight
      }
      instance.update()
    }, [element, minWidth, maxWidth, maxHeight])
  },
)
