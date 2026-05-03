import { Phone, Globe, Star, MapPin, Clock, MessageSquare } from 'lucide-react'
import Card, { CardBody } from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={13} className="fill-yellow-400 text-yellow-400" />
      <span className="text-sm font-medium text-gray-700">{rating?.toFixed(1)}</span>
    </div>
  )
}

export default function BusinessCard({ business, onMessage, selected, onSelect }) {
  return (
    <Card
      className={`transition-all cursor-pointer hover:shadow-md ${
        selected ? 'ring-2 ring-brand-500' : ''
      }`}
      onClick={() => onSelect?.(business)}
    >
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{business.name}</h3>
            <Badge color="blue" className="mt-1">{business.category}</Badge>
          </div>
          {business.rating && <StarRating rating={business.rating} />}
        </div>

        <div className="space-y-1.5 text-xs text-gray-500">
          {business.address && (
            <div className="flex items-start gap-1.5">
              <MapPin size={12} className="shrink-0 mt-0.5" />
              <span className="truncate">{business.address}</span>
            </div>
          )}
          {business.phone && (
            <div className="flex items-center gap-1.5">
              <Phone size={12} className="shrink-0" />
              <a
                href={`tel:${business.phone}`}
                className="hover:text-brand-600"
                onClick={(e) => e.stopPropagation()}
              >
                {business.phone}
              </a>
            </div>
          )}
          {business.website && (
            <div className="flex items-center gap-1.5">
              <Globe size={12} className="shrink-0" />
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-600 truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {business.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          {business.openingHours?.isOpen !== undefined && (
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="shrink-0" />
              <span className={business.openingHours.isOpen ? 'text-green-600' : 'text-red-500'}>
                {business.openingHours.isOpen ? 'Open now' : 'Closed'}
              </span>
            </div>
          )}
        </div>

        {business.totalRatings && (
          <p className="text-xs text-gray-400">{business.totalRatings.toLocaleString()} reviews</p>
        )}

        <Button
          size="sm"
          variant="secondary"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation()
            onMessage?.(business)
          }}
        >
          <MessageSquare size={14} />
          Compose Message
        </Button>
      </CardBody>
    </Card>
  )
}
