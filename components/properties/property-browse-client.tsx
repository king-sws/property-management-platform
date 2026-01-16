/* eslint-disable react-hooks/immutability */
// components/properties/property-browse-client.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Home,
  Bed,
  Bath,
  DollarSign,
  Square,
  Filter,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getAvailableProperties, getFilterOptions } from "@/actions/browse-properties";

interface PropertyType {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  type: string;
  description: string | null;
  images: Array<{ id: string; url: string; caption: string | null; isPrimary: boolean }>;
  availableUnits: number;
  minRent: number;
  maxRent: number;
  units: Array<{
    id: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number | null;
  }>;
}

interface FilterOptions {
  cities: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

export default function PropertyBrowseClient() {
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ 
    cities: [], 
    priceRange: { min: 0, max: 5000 } 
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [bedrooms, setBedrooms] = useState("all");
  const [bathrooms, setBathrooms] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [propsResult, filtersResult] = await Promise.all([
      getAvailableProperties(),
      getFilterOptions(),
    ]);

    if (propsResult.success) {
      setProperties(propsResult.properties as PropertyType[]);
    }

    if (filtersResult.success && filtersResult.options) {
      setFilterOptions(filtersResult.options);
    }

    setLoading(false);
  };

  const handleFilter = async () => {
    setLoading(true);
    const filters = {
      search: search || undefined,
      city: selectedCity !== "all" ? selectedCity : undefined,
      propertyType: selectedType !== "all" ? selectedType : undefined,
      bedrooms: bedrooms !== "all" ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms !== "all" ? parseFloat(bathrooms) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    };

    const result = await getAvailableProperties(filters);
    if (result.success) {
      setProperties(result.properties as PropertyType[]);
    }
    setLoading(false);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCity("all");
    setSelectedType("all");
    setBedrooms("all");
    setBathrooms("all");
    setMinPrice("");
    setMaxPrice("");
    loadData();
  };

  const activeFilterCount = [
    search,
    selectedCity !== "all",
    selectedType !== "all",
    bedrooms !== "all",
    bathrooms !== "all",
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by property name, address, or city..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
          />
        </div>
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        <Button onClick={handleFilter}>Search</Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {filterOptions.cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="SINGLE_FAMILY">Single Family</SelectItem>
                  <SelectItem value="MULTI_FAMILY">Multi Family</SelectItem>
                  <SelectItem value="APARTMENT">Apartment</SelectItem>
                  <SelectItem value="CONDO">Condo</SelectItem>
                  <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger>
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Bedrooms</SelectItem>
                  <SelectItem value="0">Studio</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bathrooms} onValueChange={setBathrooms}>
                <SelectTrigger>
                  <SelectValue placeholder="Bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Bathrooms</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="1.5">1.5+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min $"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max $"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${properties.length} properties found`}
        </p>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-64 bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property }: { property: PropertyType }) {
  const propertyTypeLabels: Record<string, string> = {
    SINGLE_FAMILY: "Single Family",
    MULTI_FAMILY: "Multi Family",
    APARTMENT: "Apartment",
    CONDO: "Condo",
    TOWNHOUSE: "Townhouse",
    COMMERCIAL: "Commercial",
    OTHER: "Other",
  };

  return (
    <Link href={`/dashboard/browse-properties/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {property.images[0] ? (
            <Image
              src={property.images[0].url}
              alt={property.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Home className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <Badge className="absolute left-3 top-3 bg-white/90 text-slate-900">
            {propertyTypeLabels[property.type] || property.type}
          </Badge>
          {property.availableUnits > 0 && (
            <Badge className="absolute right-3 top-3 bg-green-600">
              {property.availableUnits} Available
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold leading-none line-clamp-1">
                {property.name}
              </h3>
              <div className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                <span className="line-clamp-1">
                  {property.address}, {property.city}, {property.state}
                </span>
              </div>
            </div>

            {/* Price Range */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-lg">
                ${property.minRent.toLocaleString()}
                {property.minRent !== property.maxRent && 
                  ` - $${property.maxRent.toLocaleString()}`}
              </span>
              <span className="text-xs text-muted-foreground">/month</span>
            </div>

            {/* Unit Details */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span>
                  {Math.min(...property.units.map(u => u.bedrooms))}-
                  {Math.max(...property.units.map(u => u.bedrooms))} bed
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span>
                  {Math.min(...property.units.map(u => u.bathrooms))}-
                  {Math.max(...property.units.map(u => u.bathrooms))} bath
                </span>
              </div>
              {property.units[0]?.squareFeet && (
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4 text-muted-foreground" />
                  <span>{property.units[0].squareFeet} sqft</span>
                </div>
              )}
            </div>

            {/* Description Preview */}
            {property.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {property.description}
              </p>
            )}

            {/* View Button */}
            <Button className="w-full" variant="outline">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}