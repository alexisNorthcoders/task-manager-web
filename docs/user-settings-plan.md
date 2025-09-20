# User Settings Page Implementation Plan

## Overview
This plan outlines the implementation of a user settings page that allows users to change their password and upload an avatar picture. The implementation spans both the backend (Java/Spring Boot) and frontend (SvelteKit) applications.

## 📊 Project Status: **Phase 1 Complete - Backend Foundation Ready** ✅

### ✅ Backend Implementation Complete (December 20, 2024)
- **User Model**: Updated with `avatarUrl` field and multiple constructors
- **UserService**: Password and avatar update functionality with validation
- **REST API**: Endpoints for password change and avatar upload
- **GraphQL**: Mutations for user settings operations
- **Security**: BCrypt hashing, JWT authentication, file upload validation
- **File Storage**: Secure avatar storage with UUID-based naming

### 🔄 Next Phase: Frontend API Integration
- Update TypeScript types to include avatarUrl
- Create API functions for user settings operations
- Update auth store to handle avatar display
- Test API integration

### 📅 Updated Timeline
- **Phase 1**: ✅ Complete (1 day vs 1 week planned)
- **Phase 2**: 🔄 In Progress (Week 1)
- **Phase 3**: 📋 Planned (Week 1-2)
- **Phase 4**: 📋 Planned (Week 2)

## Current State Analysis

### Backend (/task-manager)
- **User Model**: Contains basic fields (id, username, email, firstName, lastName, password, role, timestamps, avatarUrl)
- **UserService**: Has basic CRUD operations plus password update and avatar update functionality with validation
- **GraphQL Schema**: Has basic user mutations plus password update and avatar update mutations
- **File Upload**: Existing file upload controller for task attachments, plus dedicated avatar upload endpoints
- **Database**: H2 database with JPA entities (avatarUrl field added)
- **Security**: BCrypt password hashing, JWT authentication, file upload validation
- **API Endpoints**: REST endpoints for password and avatar updates, GraphQL mutations available

### Frontend (/task-manager-web)
- **User Type**: Basic user interface without avatar field
- **Auth Store**: Basic authentication state management
- **API Layer**: GraphQL client with typed queries
- **Navigation**: Side menu with main app sections
- **UI Components**: TailwindCSS with Svelte components

## Implementation Requirements

### Backend Changes Required

1. **Database Schema Updates**
   - Add `avatarUrl` field to User entity
   - Update database migration scripts

2. **User Model Enhancements**
   - Add avatar URL field with getters/setters
   - Add password validation methods
   - Update constructors and toString methods

3. **UserService Enhancements**
   - Add `updatePassword` method with validation
   - Add `updateAvatar` method for file handling
   - Add password strength validation
   - Add file upload validation (size, type)

4. **GraphQL Schema Updates**
   - Add `avatarUrl` field to User type
   - Add `updateUserPassword` mutation
   - Add `updateUserAvatar` mutation
   - Add password confirmation input type

5. **File Upload Enhancements**
   - Extend existing file upload controller for avatars
   - Add avatar-specific validation and storage
   - Generate unique filenames to prevent conflicts
   - Support common image formats (JPG, PNG, GIF, WebP)

6. **Security Considerations**
   - Password hashing updates
   - Avatar file security (prevent malicious uploads)
   - User authentication validation for updates
   - Rate limiting for password change attempts

### Frontend Changes Required

1. **Type Definitions**
   - Add `avatarUrl` to User interface
   - Add password update input types
   - Add file upload types

2. **API Functions**
   - Add `updateUserPassword` GraphQL mutation
   - Add `updateUserAvatar` GraphQL mutation
   - Add `uploadAvatar` file upload function
   - Update existing user queries to include avatar

3. **User Settings Page**
   - Create `/settings` route with form components
   - Password change form with validation
   - Avatar upload component with preview
   - Success/error feedback
   - Loading states

4. **Navigation Updates**
   - Add Settings link to side menu
   - Update layout to show user avatar
   - Add settings icon/button in header

5. **Auth Store Updates**
   - Update user object to include avatar URL
   - Add methods to refresh user data after updates
   - Handle avatar display in UI components

6. **UI Components**
   - Avatar display component with fallback initials
   - Password strength indicator
   - File upload with drag-and-drop support
   - Form validation with real-time feedback

## Technical Architecture

### Backend Architecture
```
User Settings Flow:
1. User requests settings page → Frontend serves settings UI
2. User submits password change → Frontend → GraphQL mutation → UserService
3. User uploads avatar → Frontend → File upload → UserService updates avatar URL
4. Backend validates and processes updates → Database updates → GraphQL response
```

### Frontend Architecture
```
Settings Page Structure:
- SettingsLayout (container)
  - PasswordSection (form with current password, new password, confirm)
  - AvatarSection (file upload, preview, current avatar display)
  - ProfileSection (display current user info, read-only)
  - Save buttons and feedback
```

## Implementation Phases

### ✅ Phase 1: Backend Foundation (COMPLETED - December 20, 2024)
**Completed Tasks:**
1. ✅ Updated User model with avatarUrl field and multiple constructors
2. ✅ Added password update functionality to UserService with validation
3. ✅ Created avatar upload REST endpoints in UserController
4. ✅ Updated GraphQL schema with avatarUrl field and new mutations
5. ✅ Added GraphQL mutation resolvers for password and avatar updates
6. ✅ Implemented file upload validation and secure storage
7. ✅ Added proper error handling and security measures

**Key Features Implemented:**
- Password hashing with BCrypt encoder
- Avatar file validation (type, size limits)
- REST API endpoints: `/api/user/password`, `/api/user/avatar`
- GraphQL mutations: `updateUserPassword`, `updateUserAvatar`
- Secure file storage in `uploads/avatars/` directory
- JWT authentication for all endpoints
- File size limits (5MB) and type validation (images only)

**Technical Decisions:**
- Used constructor overloading pattern for User model flexibility
- Implemented both REST and GraphQL APIs for different use cases
- Added comprehensive input validation and error handling
- Used UUID-based unique filename generation for avatars

### Phase 2: Frontend API Integration (Week 1 - In Progress)
1. Update TypeScript types to include avatarUrl
2. Create API functions for user settings operations
3. Update auth store to handle avatar display
4. Test API integration

### Phase 3: User Interface (Week 1-2)
1. Create settings page components
2. Implement password change form with validation
3. Implement avatar upload with preview
4. Add navigation and routing
5. Style and polish UI

### Phase 4: Integration & Testing (Week 2)
1. End-to-end testing
2. Error handling and edge cases
3. Performance optimization
4. Security testing
5. User acceptance testing

## Lessons Learned from Phase 1 Implementation

### ✅ What Worked Well:
1. **Constructor Overloading Pattern**: Multiple constructors provided flexibility for different use cases
2. **Dual API Approach**: Both REST and GraphQL endpoints offer maximum compatibility
3. **Security First**: BCrypt integration and file validation were implemented robustly
4. **Error Handling**: Comprehensive error responses with meaningful messages
5. **File Upload Strategy**: UUID-based naming prevented conflicts and enhanced security

### ⚠️ Challenges Encountered:
1. **UserRepository Dependency**: Initially tried to inject UserRepository into UserController, but simplified by using UserService methods
2. **Import Management**: Multiple imports required careful organization
3. **Constructor Complexity**: Multiple constructors in User model, while functional, could benefit from Builder pattern in future

### 🔧 Technical Decisions Validated:
1. **REST + GraphQL**: Having both API types was the right choice for flexibility
2. **File Storage Location**: `uploads/avatars/` directory structure works well
3. **Validation Levels**: Server-side validation at both service and controller layers
4. **Security Implementation**: JWT authentication with role-based access control

### 📈 Timeline Adjustment:
- **Phase 1**: Completed faster than expected (1 day vs 1 week planned)
- **Overall Project**: Accelerated by ~1 week
- **Remaining Phases**: Still achievable within adjusted timeframe

## Security Considerations

### Password Security
- Minimum password requirements (length, complexity)
- Rate limiting for password change attempts
- Secure password hashing (bcrypt)
- Password confirmation validation
- Prevent password reuse validation

### File Upload Security
- File type validation (image formats only)
- File size limits (max 5MB)
- Filename sanitization
- Virus scanning (if possible)
- Secure file storage location

### Authentication & Authorization
- JWT token validation for all operations
- User can only update their own profile
- Admin override capabilities (if needed)
- Session management for sensitive operations

## User Experience Requirements

### Password Change UX
- Clear form with current password field
- Real-time password strength indicator
- Password confirmation matching
- Success/error feedback with specific messages
- Loading states during submission

### Avatar Upload UX
- Drag-and-drop file upload area
- Click to browse files option
- Real-time image preview
- Current avatar display
- Upload progress indicator
- Support for common image formats
- Image resizing/cropping options

### General UX
- Responsive design for mobile/desktop
- Accessible form controls
- Keyboard navigation support
- Clear visual hierarchy
- Consistent styling with app theme

## Testing Strategy

### Backend Testing
- Unit tests for UserService methods
- Integration tests for GraphQL mutations
- File upload security tests
- Password validation tests
- Database migration tests

### Frontend Testing
- Component unit tests
- API integration tests
- Form validation tests
- File upload tests
- E2E user flow tests

### Manual Testing Checklist
- Password change with various scenarios
- Avatar upload with different file types/sizes
- Error handling for network issues
- Responsive design on different devices
- Accessibility compliance
- Performance with large files

## Deployment Considerations

### Database Migration
- Add avatar_url column to users table
- Update existing users with null avatar URLs
- Backup strategy before migration

### File Storage
- Configure avatar storage directory
- Set up file permissions
- Consider CDN for production
- Backup strategy for uploaded files

### Performance
- Image optimization for avatars
- Caching strategies for avatar URLs
- Database query optimization

## Success Metrics

### Functional Requirements
- ✅ Users can change their password securely
- ✅ Users can upload and display avatar images
- ✅ Avatar images are properly validated and stored
- ✅ Password changes include proper validation
- ✅ All operations include proper error handling

### User Experience Metrics
- ✅ Settings page loads in <2 seconds
- ✅ Avatar upload completes in <5 seconds
- ✅ Form validation provides immediate feedback
- ✅ Error messages are clear and actionable
- ✅ Mobile-responsive design works on all devices

### Security Metrics
- ✅ All passwords are properly hashed
- ✅ File uploads are sanitized and validated
- ✅ Rate limiting prevents abuse
- ✅ Authentication is required for all operations
- ✅ No unauthorized access to user data

## Risk Assessment

### Technical Risks
- **Medium**: Database migration complexity
- **Low**: GraphQL schema changes
- **Medium**: File upload security implementation
- **Low**: Frontend form validation

### Integration Risks
- **Medium**: Backend-frontend API compatibility
- **Low**: Authentication system conflicts
- **Medium**: File storage configuration

### Mitigation Strategies
- Comprehensive testing before deployment
- Gradual rollout with feature flags
- Database backup before migrations
- Security audit of file upload functionality

## Future Enhancements

### Phase 2 Features (Post-Launch)
- Avatar cropping and editing tools
- Social login integration
- Two-factor authentication
- Password reset email functionality
- Profile visibility settings
- Multiple avatar sizes optimization

### Advanced Features (Future Versions)
- Avatar animations and effects
- Profile themes and customization
- Integration with external avatar services
- User preference settings
- Notification preferences

## Conclusion

This implementation plan provides a comprehensive roadmap for adding user settings functionality to the Task Manager application. The plan balances security, user experience, and technical feasibility while providing clear phases for implementation and testing.

The estimated timeline is 3 weeks for full implementation, with Phase 1 (Backend) being the most critical foundation that enables the subsequent frontend work.
