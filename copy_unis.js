const fs = require('fs');
const path = require('path');

const studentPagePath = path.join(__dirname, 'src', 'app', 'student', 'universities', 'page.jsx');
const dashboardPagePath = path.join(__dirname, 'src', 'app', 'dashboard', 'universities', 'page.jsx');
const adminPagePath = path.join(__dirname, 'src', 'app', 'admin', 'universities', 'page.jsx');

const content = fs.readFileSync(studentPagePath, 'utf8');

// The dashboard (Agency) view needs to be updated:
// Change "StudentUniversitiesPage" to "AgencyUniversitiesPage"
// Change `<a href="/student/applications"...>` to `<a href="/dashboard/applications"...>`
let dashboardContent = content
  .replace(/StudentUniversitiesPage/g, 'AgencyUniversitiesPage')
  .replace(/\/student\/applications/g, '/dashboard/applications');

// The Admin view needs to be updated:
// Change "StudentUniversitiesPage" to "AdminUniversitiesPage"
// Admin probably doesn't apply. Maybe they just view. We can leave it pointing to `/admin/applications` for consistency or change it.
let adminContent = content
  .replace(/StudentUniversitiesPage/g, 'AdminUniversitiesPage')
  .replace(/\/student\/applications/g, '/admin/applications')
  .replace(/Apply Now/g, 'View Applications')
  .replace(/Apply to/g, 'Applications for');

fs.mkdirSync(path.dirname(dashboardPagePath), { recursive: true });
fs.writeFileSync(dashboardPagePath, dashboardContent);

fs.mkdirSync(path.dirname(adminPagePath), { recursive: true });
fs.writeFileSync(adminPagePath, adminContent);

console.log('Copied and adapted universities pages.');
