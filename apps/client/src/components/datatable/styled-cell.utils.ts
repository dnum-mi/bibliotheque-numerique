interface StyledCellOptions {
  class?: string
  transform?: (value: string) => string
}

interface RendererParams {
  params: {
    value: string | null
  }
}

export const styledCell = ({ class: cls, transform }: StyledCellOptions) => ({
  renderer: markRaw(
    defineComponent({
      props: ['params'],
      setup (props: RendererParams) {
        return () => h(
          'span',
          { class: cls },
          transform
            ? transform(props.params.value ?? '')
            : (props.params.value ?? ''),
        )
      },
    }),
  ),
})
