# Campaign Manager

A modern, client-side web application for creating and managing marketing campaigns including banners, email campaigns, and landing pages.

## Features

### 🔐 Authentication System
- **Login/Signup**: Secure user authentication with LocalStorage
- **Demo Account**: Pre-created test user (`demo` / `demo123`)
- **Session Management**: Automatic login state persistence

### 📊 Dashboard
- **Campaign Statistics**: Real-time stats for all campaign types
- **Quick Actions**: One-click access to campaign editors
- **Recent Campaigns**: Sortable and filterable campaign list
- **Responsive Design**: Works on mobile, tablet, and desktop

### 🎨 Banner Editor
- **Multiple Sizes**: 250×250 (square) and 300×600 (vertical) formats
- **Real-time Preview**: Live updates as you edit
- **Text Customization**: Font family, size, color customization
- **Background Control**: Color selection and styling
- **Save & Duplicate**: Campaign management features

### 📧 Email Campaign Editor
- **Template Selection**: 3 professional email templates
  - Newsletter: Perfect for regular updates
  - Promotional: Great for sales and offers
  - Announcement: Ideal for important news
- **Content Management**: Heading, content, CTA, and image support
- **Responsive Preview**: Mobile and desktop view modes
- **Color Customization**: Primary and accent color controls

### 🖥️ Landing Page Editor
- **Template Variety**: 3 landing page templates
  - Hero Section: Bold hero with compelling headline
  - Features Focus: Highlight key benefits
  - Minimal Clean: Simple and effective design
- **Lead Collection**: Optional contact form builder
- **Multi-device Preview**: Mobile, tablet, and desktop views
- **Advanced Styling**: Font, color, and layout controls

## Getting Started

### Installation

1. **Download/Clone** the project files to your local machine
2. **No build process required** - this is a pure HTML/CSS/JavaScript application
3. **Open** `login.html` in your web browser to start

### Demo Account

Use these credentials to test the application:
- **Username**: `demo`
- **Password**: `demo123`

### File Structure

```
CampaignManager/
├── login.html              # Login and signup page
├── index.html              # Dashboard (main app)
├── banner-editor.html      # Banner creation tool
├── email-editor.html       # Email campaign editor
├── landing-editor.html     # Landing page builder
├── css/
│   ├── styles.css          # Global styles and components
│   ├── login.css           # Login page specific styles
│   ├── dashboard.css       # Dashboard specific styles
│   └── editor.css          # Editor pages specific styles
├── js/
│   ├── storage.js          # LocalStorage management
│   ├── auth.js             # Authentication system
│   ├── dashboard.js        # Dashboard functionality
│   ├── banner-editor.js    # Banner editor logic
│   ├── email-editor.js     # Email editor logic
│   └── landing-editor.js   # Landing page editor logic
└── README.md               # This file
```

## How to Use

### 1. Login/Signup
- Open `login.html` in your browser
- Use demo credentials or create a new account
- New accounts are stored in browser LocalStorage

### 2. Dashboard Navigation
- View campaign statistics at the top
- Use quick action cards to create new campaigns
- Browse and filter existing campaigns in the table
- Click edit buttons to modify campaigns

### 3. Creating Campaigns

#### Banner Editor
1. Choose banner size (250×250 or 300×600)
2. Add your text content
3. Customize font, size, and colors
4. Preview updates in real-time
5. Save as draft or publish

#### Email Editor
1. Select an email template
2. Fill in campaign details and subject
3. Add heading, content, and call-to-action
4. Customize colors and fonts
5. Preview in mobile/desktop views
6. Save when ready

#### Landing Page Editor
1. Choose a template style
2. Add main heading and content
3. Set up call-to-action buttons
4. Optionally enable lead collection form
5. Preview across device sizes
6. Save and publish

### 4. Campaign Management
- **Edit**: Click edit buttons to modify campaigns
- **Duplicate**: Create copies of existing campaigns
- **Delete**: Remove campaigns (with confirmation)
- **Filter**: Sort by type (Banner/Email/Landing) and status
- **Search**: Find campaigns by name

## Technical Details

### Browser Compatibility
- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

### Storage
- All data is stored in browser LocalStorage
- No server or database required
- Data persists between sessions
- Export/import capabilities available

### Responsive Design
- Mobile-first approach
- Breakpoints: 480px, 768px, 1200px
- Touch-friendly interface
- Optimized for all screen sizes

### Performance
- Lightweight (~500KB total)
- Fast loading times
- Efficient DOM manipulation
- Optimized images and assets

## Keyboard Shortcuts

### Global
- `Ctrl/Cmd + S`: Save current campaign
- `Ctrl/Cmd + R`: Reset to defaults
- `Escape`: Close modals

### Dashboard
- `Ctrl/Cmd + N`: Focus on quick actions
- `Ctrl/Cmd + R`: Refresh data

### Editors
- `M`: Switch to mobile preview (where available)
- `D`: Switch to desktop preview (where available)
- `1/2/3`: Switch between preview modes (landing editor)

## Data Management

### LocalStorage Structure
```javascript
{
  "campaignManager_users": [...],      // User accounts
  "campaignManager_currentUser": {...}, // Current session
  "campaignManager_campaigns": [...]    // All campaigns
}
```

### Data Export/Import
- Export all data as JSON from dashboard
- Import previous backups
- Data validation and integrity checks

## Customization

### Themes
- CSS custom properties for easy theming
- Dark mode support (system preference)
- High contrast mode support

### Extensions
- Modular JavaScript architecture
- Easy to add new campaign types
- Extensible storage system
- Plugin-ready structure

## Browser Requirements

### Required Features
- ES6+ JavaScript support
- CSS Grid and Flexbox
- LocalStorage API
- Modern DOM APIs

### Optional Features
- CSS custom properties (fallbacks provided)
- Touch events (mouse events work fine)
- Service workers (for future PWA features)

## Troubleshooting

### Common Issues

1. **Data Not Saving**
   - Check if LocalStorage is enabled
   - Ensure sufficient storage space
   - Try clearing browser cache

2. **Login Issues**
   - Verify demo credentials: `demo` / `demo123`
   - Check browser console for errors
   - Try creating a new account

3. **Preview Not Updating**
   - Check browser console for JavaScript errors
   - Ensure all files are properly loaded
   - Try refreshing the page

4. **Responsive Issues**
   - Clear browser cache
   - Check viewport meta tag
   - Test in different browsers

### Browser Storage Limits
- LocalStorage limit: ~5-10MB per domain
- Monitor usage in dashboard
- Export data regularly for backup

## Future Enhancements

### Planned Features
- Campaign analytics and reporting
- Email template import/export
- Advanced image editing tools
- Campaign scheduling
- Team collaboration features
- API integration capabilities

### Technical Improvements
- Progressive Web App (PWA) support
- Offline functionality
- Cloud storage integration
- Advanced security features
- Performance optimizations

## Support

### Getting Help
1. Check this README for common solutions
2. Review browser console for error messages
3. Test in different browsers
4. Verify file structure and permissions

### Reporting Issues
When reporting issues, please include:
- Browser name and version
- Operating system
- Steps to reproduce
- Error messages (if any)
- Expected vs. actual behavior

---

**Campaign Manager** - Built with modern web technologies for maximum compatibility and performance.

© 2024 Campaign Manager. All rights reserved.
