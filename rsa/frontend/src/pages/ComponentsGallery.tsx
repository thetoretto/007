import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, AlertCircle, Settings, Plus, CheckCircle, Info, 
  Facebook, Twitter, Instagram, Mail, Phone, MapPin, Menu, X, ChevronDown, Bus, 
  User, Search, ArrowRight, CreditCard, QrCode, Eye, EyeOff } from 'lucide-react';

// Import components
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProgressBar from '../components/common/ProgressBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import QRScannerIcon from '../components/icons/QRScannerIcon';

const ComponentsGallery: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Components Gallery</h1>
        <p className="text-gray-500">A showcase of all UI components used in the RideBooker application.</p>
      </div>

      {/* Navigation */}
      <div className="mb-8">
        <div className="flex space-x-4 mb-4">
          <a href="#buttons" className="btn btn-secondary">Buttons</a>
          <a href="#forms" className="btn btn-secondary">Form Elements</a>
          <a href="#cards" className="btn btn-secondary">Cards</a>
          <a href="#navigation" className="btn btn-secondary">Navigation</a>
          <a href="#feedback" className="btn btn-secondary">Feedback</a>
          <a href="#icons" className="btn btn-secondary">Icons</a>
        </div>
      </div>

      {/* Buttons Section */}
      <section id="buttons" className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">Buttons</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Primary Button</h3>
            <button className="btn btn-primary">Primary Button</button>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">.btn.btn-primary</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Secondary Button</h3>
            <button className="btn btn-secondary">Secondary Button</button>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">.btn.btn-secondary</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Danger Button</h3>
            <button className="btn btn-danger">Danger Button</button>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">.btn.btn-danger</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Success Button</h3>
            <button className="btn bg-success-500 hover:bg-success-600 text-white">Success Button</button>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">.btn.bg-success-500</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Button with Icon</h3>
            <button className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </button>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">.btn with Lucide icon</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Link Button</h3>
            <Link to="#" className="btn btn-primary">Link Button</Link>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">Link with .btn class</code>
            </div>
          </div>
        </div>
      </section>

      {/* Form Elements Section */}
      <section id="forms" className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">Form Elements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Text Input</h3>
            <div>
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-1">
                Text Input
              </label>
              <input
                id="text-input"
                type="text"
                className="form-input"
                placeholder="Enter text here"
              />
            </div>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">.form-input</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Password Input with Toggle</h3>
            <div>
              <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type="password"
                  className="form-input pr-10"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <Eye className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">.form-input with icon button</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Checkbox</h3>
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">checkbox input styling</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Search Input</h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="form-input pl-10"
              />
            </div>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">.form-input with icon</code>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section id="cards" className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">Cards & Containers</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Basic Card</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4 border border-gray-200">
              <h4 className="font-medium text-lg mb-2">Card Title</h4>
              <p className="text-gray-600">This is a basic card component used throughout the application.</p>
            </div>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">.bg-white.rounded-lg.shadow-sm</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Card with Header</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-4 border-b border-gray-200">
                <h4 className="text-lg font-medium text-gray-900">Card Header</h4>
              </div>
              <div className="p-4">
                <p className="text-gray-600">Card content goes here. This pattern is used in dashboard panels.</p>
              </div>
            </div>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">Card with separated header</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Info Card</h3>
            <div className="p-3 bg-primary-50 rounded-lg border border-primary-100 flex items-start">
              <Info className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-primary-800 font-medium">Information</p>
                <p className="text-xs text-primary-700 mt-1">
                  This is an information card used to display important notices to users.
                </p>
              </div>
            </div>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">.bg-primary-50 with icon</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Stat Card</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Total Trips</p>
              <p className="text-2xl font-bold text-primary-600">24</p>
            </div>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">.bg-gray-50.rounded-lg</code>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Components */}
      <section id="navigation" className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">Navigation Components</h2>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Progress Bar</h3>
            <ProgressBar 
              steps={["Route", "Vehicle", "Schedule", "Extras", "Payment"]} 
              currentStep={3} 
            />
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">ProgressBar component</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Tab Navigation</h3>
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto py-3 space-x-4">
                <button className="px-4 py-2 text-sm font-medium rounded-md bg-primary-100 text-primary-700">
                  All Trips
                </button>
                <button className="px-4 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                  Upcoming
                </button>
                <button className="px-4 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                  Completed
                </button>
                <button className="px-4 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                  Cancelled
                </button>
              </div>
            </div>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">Tab navigation pattern</code>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Components */}
      <section id="feedback" className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">Feedback Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Loading Spinner</h3>
            <div className="flex justify-center py-4">
              <LoadingSpinner size="medium" />
            </div>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">LoadingSpinner component</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-primary flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Confirmed
              </span>
              <span className="badge badge-success flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </span>
              <span className="badge badge-warning flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Pending
              </span>
              <span className="badge badge-error flex items-center">
                <X className="h-3 w-3 mr-1" />
                Cancelled
              </span>
              <span className="badge badge-gray">
                Default
              </span>
            </div>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">.badge with variants</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Alert - Error</h3>
            <div className="p-4 bg-error-50 text-error-700 rounded-md">
              <p>Error: Something went wrong. Please try again.</p>
            </div>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">.bg-error-50.text-error-700</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Empty State</h3>
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming trips</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any scheduled trips at the moment.
              </p>
              <div className="mt-6">
                <button className="btn btn-primary">Create New Trip</button>
              </div>
            </div>
            <div className="mt-2">
              <code className="text-xs bg-gray-100 p-1 rounded">Empty state pattern</code>
            </div>
          </div>
        </div>
      </section>

      {/* Icons Section */}
      <section id="icons" className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">Icons</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <Calendar className="h-8 w-8 text-gray-700" />
            <span className="mt-2 text-xs text-gray-500">Calendar</span>
          </div>
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <Clock className="h-8 w-8 text-gray-700" />
            <span className="mt-2 text-xs text-gray-500">Clock</span>
          </div>
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <Users className="h-8 w-8 text-gray-700" />
            <span className="mt-2 text-xs text-gray-500">Users</span>
          </div>
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <AlertCircle className="h-8 w-8 text-gray-700" />
            <span className="mt-2 text-xs text-gray-500">AlertCircle</span>
          </div>
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <Settings className="h-8 w-8 text-gray-700" />
            <span className="mt-2 text-xs text-gray-500">Settings</span>
          </div>
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <Plus className="h-8 w-8 text-gray-700" />
            <span className="mt-2 text-xs text-gray-500">Plus</span>
          </div>
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <CheckCircle className="h-8 w-8 text-gray-700" />
            <span className="mt-2 text-xs text-gray-500">CheckCircle</span>
          </div>
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <Info className="h-8 w-8 text-gray-700" />
            <span className="mt-2 text-xs text-gray-500">Info</span>
          </div>
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <MapPin className="h-8 w-8 text-gray-700" />
            <span className="mt-2 text-xs text-gray-500">MapPin</span>
          </div>
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <Bus className="h-8 w-8 text-gray-700" />
            <span className="mt-2 text-xs text-gray-500">Bus</span>
          </div>
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <QRScannerIcon className="h-8 w-8 text-gray-700" />
            <span className="mt-2 text-xs text-gray-500">QRScanner</span>
          </div>
          <div className="p-4 border rounded-lg flex flex-col items-center">
            <ArrowRight className="h-8 w-8 text-gray-700" />
            <span className="mt-2 text-xs text-gray-500">ArrowRight</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComponentsGallery;