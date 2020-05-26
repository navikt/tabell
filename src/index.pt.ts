import PT from 'prop-types'

export const FlagItemPropType = PT.shape({
  label: PT.string.isRequired,
  country: PT.string.isRequired
})

export const FlagItemsPropType = PT.arrayOf(FlagItemPropType)
