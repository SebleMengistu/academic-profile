# Database Schema

MongoDB database: `academic_profile`

---

## Collections Overview

| Collection | Description |
|------------|-------------|
| `users` | Admin user accounts |
| `profiles` | Researcher profile (single document) |
| `academicappointments` | Academic positions |
| `educations` | Degrees and qualifications |
| `researchareas` | Research theme areas |
| `publications` | Journal articles, books, etc. |
| `fundedresearches` | Grants and funded projects |
| `teachings` | Courses taught |
| `supervisions` | Student supervision records |
| `serviceleaderships` | Service and leadership roles |
| `memberships` | Professional memberships |
| `awards` | Awards and honours |
| `medias` | Media items |
| `externalprofiles` | External profile links |
| `contactmessages` | Contact form submissions |
| `auditlogs` | Admin action log |
| `analyticsevents` | Page/entity view tracking |
| `settings` | Site-wide settings |

---

## users

```
_id:                  ObjectId
firstName:            String (required)
lastName:             String (required)
email:                String (required, unique, lowercase)
password:             String (hashed, bcrypt 12 rounds, select: false)
role:                 Enum["SUPER_ADMIN", "PROFILE_OWNER", "EDITOR"]
isActive:             Boolean (default: true)
lastLogin:            Date
refreshToken:         String (select: false)
passwordResetToken:   String (select: false)
passwordResetExpires: Date (select: false)
createdAt:            Date
updatedAt:            Date
```

**Indexes:** `email` (unique)

---

## profiles

Single document — upserted by the admin.

```
_id:                  ObjectId
title:                String
firstName:            String (required)
middleName:           String
lastName:             String (required)
displayName:          String (required)
profilePhoto:         String (Cloudinary URL)
profilePhotoPublicId: String
professionalTitle:    String
currentPosition:      String
department:           String
faculty:              String
institution:          String
shortBio:             String (max 500)
biography:            String (HTML — sanitised)
researchStatement:    String (HTML — sanitised)
careerSummary:        String (HTML — sanitised)
email:                String
phone:                String
office:               String
address:              String
country:              String
orcid:                String
profileType:          String (default: "Academic")
cvUrl:                String
cvPublicId:           String
visibility:           Enum["PUBLIC", "PRIVATE"] (default: "PUBLIC")
createdAt:            Date
updatedAt:            Date
```

---

## academicappointments

```
_id:           ObjectId
title:         String (required)
institution:   String (required)
faculty:       String
department:    String
location:      String
startDate:     Date (required)
endDate:       Date
isCurrent:     Boolean (default: false)
description:   String
displayOrder:  Number (default: 0)
createdAt:     Date
updatedAt:     Date
```

**Indexes:** `displayOrder`

---

## educations

```
_id:             ObjectId
degree:          String (required)  — PhD, MSc, MEng, BSc …
field:           String (required)
institution:     String (required)
location:        String
country:         String
startDate:       Date
completionDate:  Date
thesisTitle:     String
thesisUrl:       String
description:     String
displayOrder:    Number (default: 0)
createdAt:       Date
updatedAt:       Date
```

**Indexes:** `displayOrder`

---

## researchareas

```
_id:          ObjectId
name:         String (required)
slug:         String (required, unique)
description:  String
icon:         String
displayOrder: Number (default: 0)
createdAt:    Date
updatedAt:    Date
```

**Indexes:** `slug` (unique), `displayOrder`, text index on `name`

---

## publications

```
_id:              ObjectId
title:            String (required)
slug:             String (required, unique)
abstract:         String (HTML)
publicationType:  Enum["Journal Article","Conference Paper","Book","Book Chapter",
                       "Technical Report","Patent","Dataset","Software","Thesis",
                       "Poster","Other"]
authors: [
  name:             String (required)
  affiliation:      String
  orcid:            String
  isCorresponding:  Boolean
  order:            Number
]
journal:           String
conference:        String
publisher:         String
volume:            String
issue:             String
pages:             String
year:              Number (required)
publicationDate:   Date
doi:               String
isbn:              String
issn:              String
keywords:          [String]
citation:          String
pdfUrl:            String (Cloudinary URL)
pdfPublicId:       String
externalUrl:       String
researchAreas:     [ObjectId → researchareas]
featured:          Boolean (default: false)
status:            Enum["DRAFT","PUBLISHED","ARCHIVED","SCHEDULED"]
visibility:        Enum["PUBLIC","PRIVATE"]
views:             Number (default: 0)
createdAt:         Date
updatedAt:         Date
```

**Indexes:** `slug` (unique), `year`, `publicationType`, `status`, `featured`, `researchAreas`, text index on `title + abstract + keywords`

---

## fundedresearches

```
_id:                   ObjectId
title:                 String (required)
slug:                  String (required, unique)
description:           String (HTML)
fundingType:           Enum["Grant","Contract Research","Industry Funding",
                           "Government Funding","University Funding",
                           "Fellowship","Scholarship","Other"]
funder:                String (required)
fundingScheme:         String
grantNumber:           String
amount:                Number
currency:              String (default: "USD")
startDate:             Date (required)
endDate:               Date
status:                Enum["ACTIVE","COMPLETED","PENDING","CANCELLED"]
principalInvestigator: String (required)
teamMembers: [
  name:         String (required)
  role:         Enum["Principal Investigator","Co-Investigator","Researcher",
                     "PhD Student","Research Assistant","Industry Partner",
                     "External Collaborator"]
  affiliation:  String
]
researchAreas:         [ObjectId → researchareas]
externalUrl:           String
featured:              Boolean
contentStatus:         Enum["DRAFT","PUBLISHED","ARCHIVED","SCHEDULED"]
views:                 Number (default: 0)
createdAt:             Date
updatedAt:             Date
```

**Indexes:** `slug` (unique), `status`, `startDate`, text index on `title + description`

---

## teachings

```
_id:          ObjectId
courseName:   String (required)
courseCode:   String
institution:  String (required)
level:        Enum["Undergraduate","Postgraduate","PhD","Online","Other"]
semester:     String
year:         Number
description:  String
displayOrder: Number
createdAt:    Date
updatedAt:    Date
```

**Indexes:** `displayOrder`, `year`

---

## supervisions

```
_id:             ObjectId
studentName:     String (required)
degree:          Enum["PhD","Masters","Honours","Undergraduate","Other"]
researchTopic:   String (required)
role:            Enum["Principal Supervisor","Associate Supervisor",
                      "Co-Supervisor","Advisor"]
startDate:       Date
completionDate:  Date
status:          Enum["Current","Completed","Withdrawn"]
coSupervisors:   [String]
description:     String
institution:     String
createdAt:       Date
updatedAt:       Date
```

**Indexes:** `status`, `startDate`

---

## serviceleaderships

```
_id:          ObjectId
role:         String (required)
organization: String (required)
type:         Enum["Leadership","Professional Service","Editorial Board",
                   "Conference Service","Committee","Reviewer","Other"]
description:  String
startDate:    Date
endDate:      Date
isCurrent:    Boolean
externalUrl:  String
displayOrder: Number
createdAt:    Date
updatedAt:    Date
```

**Indexes:** `type`, `displayOrder`

---

## memberships

```
_id:            ObjectId
organization:   String (required)
role:           String
membershipType: String
startDate:      Date
endDate:        Date
isCurrent:      Boolean
externalUrl:    String
displayOrder:   Number
createdAt:      Date
updatedAt:      Date
```

---

## awards

```
_id:                  ObjectId
name:                 String (required)
organization:         String (required)
date:                 Date
category:             String
description:          String
certificateUrl:       String
certificatePublicId:  String
externalUrl:          String
displayOrder:         Number
createdAt:            Date
updatedAt:            Date
```

**Indexes:** `date`, `displayOrder`

---

## medias

```
_id:                ObjectId
title:              String (required)
slug:               String (required, unique)
type:               Enum["Video","Image","Interview","Podcast","News",
                         "Presentation","Other"]
description:        String (HTML)
thumbnailUrl:       String (Cloudinary URL)
thumbnailPublicId:  String
url:                String
date:               Date
caption:            String
credit:             String
visibility:         Enum["PUBLIC","PRIVATE"]
views:              Number (default: 0)
createdAt:          Date
updatedAt:          Date
```

**Indexes:** `slug` (unique), `type`, `date`, text index on `title + description`

---

## externalprofiles

```
_id:          ObjectId
platform:     Enum["ORCID","Google Scholar","ResearchGate","LinkedIn","GitHub",
                   "Scopus","Web of Science","Personal Website","YouTube",
                   "Twitter/X","Other"]
label:        String (required)
url:          String (required)
icon:         String
displayOrder: Number
active:       Boolean (default: true)
createdAt:    Date
updatedAt:    Date
```

---

## contactmessages

```
_id:       ObjectId
name:      String (required, max 100)
email:     String (required)
subject:   String (max 200)
message:   String (required, max 2000)
status:    Enum["New","Read","Replied","Archived","Spam"] (default: "New")
ipAddress: String
userAgent: String
repliedAt: Date
createdAt: Date
updatedAt: Date
```

**Indexes:** `status`, `createdAt`

---

## auditlogs

```
_id:       ObjectId
userId:    ObjectId → users
userEmail: String
userRole:  String
action:    Enum["CREATE","UPDATE","DELETE","PUBLISH","UNPUBLISH","ARCHIVE",
                "RESTORE","LOGIN","LOGOUT","FAILED_LOGIN"]
entity:    String  — e.g. "Publication", "Profile"
entityId:  String
details:   Mixed
ipAddress: String
userAgent: String
createdAt: Date   (no updatedAt)
```

**Indexes:** `userId`, `action`, `entity`, `createdAt`

---

## analyticsevents

```
_id:       ObjectId
type:      Enum["PROFILE_VIEW","PUBLICATION_VIEW","RESEARCH_VIEW","MEDIA_VIEW",
                "CV_DOWNLOAD","EXTERNAL_LINK_CLICK","CONTACT_SUBMISSION"]
page:      String
entityId:  String
referrer:  String
device:    String
browser:   String
country:   String
sessionId: String
createdAt: Date   (no updatedAt)
```

**Indexes:** `type`, `createdAt`, `entityId`

---

## settings

Single document.

```
_id:              ObjectId
siteName:         String (default: "Academic Profile")
siteUrl:          String
seo:
  title:          String
  description:    String
  keywords:       [String]
  ogImage:        String
  twitterHandle:  String
  canonicalUrl:   String
maintenanceMode:  Boolean (default: false)
allowContactForm: Boolean (default: true)
analyticsEnabled: Boolean (default: true)
googleAnalyticsId: String
footerText:       String
createdAt:        Date
updatedAt:        Date
```

---

## Indexes Summary

| Collection | Index | Type |
|------------|-------|------|
| users | email | Unique |
| researchareas | slug | Unique |
| publications | slug | Unique |
| publications | year, publicationType, status, featured | Regular |
| publications | title + abstract + keywords | Text |
| fundedresearches | slug | Unique |
| fundedresearches | status, startDate | Regular |
| fundedresearches | title + description | Text |
| medias | slug | Unique |
| medias | type, date | Regular |
| medias | title + description | Text |
| contactmessages | status, createdAt | Regular |
| auditlogs | userId, action, entity, createdAt | Regular |
| analyticsevents | type, createdAt, entityId | Regular |

---

## MongoDB Atlas Recommendations

- Enable **Atlas Search** for full-text search on publications (better than `$text`)
- Enable **automated backups** (daily snapshots)
- Enable **point-in-time recovery** for production
- Set **IP Access List** to your server IP(s) only
- Use a **dedicated M10+ cluster** for production workloads
- Create a **least-privilege database user** — read/write to `academic_profile` only
