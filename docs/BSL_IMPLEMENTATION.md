# Business Source License 1.1 - Implementation Checklist

## ✅ Implementation Process (Step by Step)

### Phase 1: Legal Setup (NOW)

#### 1. ✅ LICENSE File
- [x] Created LICENSE file with BSL 1.1 text
- [x] Set Change Date: 2029-12-21 (4 years)
- [x] Set Change License: Apache 2.0
- [x] Defined Additional Use Grant

#### 2. ⏳ Copyright Headers (NEXT)
Add to EVERY source file:
```javascript
/**
 * Copyright (c) 2025 DevSetup Team
 * Licensed under the Business Source License 1.1
 * See LICENSE in the repository root
 */
```

**Quick way to add:**
```bash
# On Ubuntu/Linux:
find src -name "*.js" -o -name "*.jsx" | xargs -I {} bash -c 'cat COPYRIGHT_HEADER.txt {} > temp && mv temp {}'
```

#### 3. ✅ CONTRIBUTING.md
- [x] Created with CLA terms
- [x] Sign-off requirement documented
- [ ] Link from README

#### 4. ⏳ README.md Updates
Add license badge and section:

```markdown
## License

DevSetup Pro is licensed under the Business Source License 1.1.

**TL;DR:**
- ✅ Free for individuals, students, non-profits
- ✅ Free for companies with < 10 employees  
- 💼 Commercial license required for companies with 10+ employees
- 🔓 Becomes Apache 2.0 licensed on 2029-12-21

See [LICENSE](LICENSE) for full terms.

For commercial licensing: business@devsetup.pro
```

### Phase 2: GitHub Setup

#### 1. Repository Settings
```yaml
# .github/ISSUE_TEMPLATE/config.yml
blank_issues_enabled: false
contact_links:
  - name: Commercial License Inquiry
    url: mailto:business@devsetup.pro
    about: For commercial licensing questions
  - name: Security Issue
    url: mailto:security@devsetup.pro
    about: Report security vulnerabilities
```

#### 2. README Badge
```markdown
[![License](https://img.shields.io/badge/License-BSL%201.1-blue.svg)](LICENSE)
```

#### 3. Repository Topics/Tags
Add to GitHub repo:
- `business-source-license`
- `bsl-1-1`
- `source-available`
- `ubuntu`
- `developer-tools`

### Phase 3: Documentation

#### 1. FAQ Section
Add to README or docs:
```markdown
## Frequently Asked Questions

**Can I use this at my company?**
Yes, if your company has fewer than 10 employees. Larger companies need a commercial license.

**Can I see the source code?**
Yes! The code is publicly available under BSL 1.1.

**Can I fork and modify?**
Yes, for personal/internal use. Redistribution must follow BSL terms.

**What happens in 2029?**
The code automatically becomes Apache 2.0 licensed (fully open source).
```

#### 2. Pricing Page (Future)
Create when ready to sell:
- Individual: FREE (with limitations)
- Small Business (< 10 employees): FREE
- Commercial (10+ employees): Contact us
- macOS: Paid only
- Enterprise: Custom pricing

### Phase 4: Legal Housekeeping (Optional but Recommended)

#### 1. Trademark
Consider registering "DevSetup Pro" trademark:
- **Cost**: ~$250-400 (USPTO)
- **Benefit**: Prevents others from using your brand name
- **Priority**: Medium (can wait until launch)

#### 2. Email Setup
Create professional emails:
- business@devsetup.pro
- security@devsetup.pro
- support@devsetup.pro
- hello@devsetup.pro

Can use free tier of:
- Google Workspace (14-day trial)
- Zoho Mail (free tier)
- ProtonMail Business

#### 3. Domain
Register devsetup.pro:
- **Cost**: ~$12/year
- **When**: Before launch
- **Use for**: Website, email, docs

### Phase 5: Commercial License Template

Create for when companies want to buy:

```
COMMERCIAL LICENSE AGREEMENT
DevSetup Pro

Licensor: DevSetup Team
Licensee: [Company Name]

Grant: The Licensor grants Licensee a non-exclusive, non-transferable 
license to use DevSetup Pro for production commercial use.

Term: Annual subscription, auto-renewing
Fee: $X per year per [seat/server/instance]

Restrictions:
- No redistribution
- No white-labeling
- No SaaS/hosted service offering

Support: Email support included
Updates: All updates during term included
```

## 🚫 What You DON'T Need

### ❌ NOT Required:
- Register BSL with any authority (it's self-enforced)
- Submit to OSI (BSL is not OSI-approved, that's intentional)
- Create new license text (BSL 1.1 is standardized)
- Lawyer review for basic use (template is proven)
- Patent filing (copyright is automatic)

### ✅ Recommended When Scaling:
- Lawyer review of commercial contracts ($500-2000)
- Trademark registration (~$400)
- Professional liability insurance (~$500-1500/year)
- Terms of Service for hosted version (if applicable)

## 📅 Timeline

### Week 1 (NOW):
- [x] LICENSE file ✅
- [x] CONTRIBUTING.md ✅
- [x] COPYRIGHT_HEADER.txt ✅
- [ ] Add headers to all files
- [ ] Update README

### Week 2 (Before Launch):
- [ ] Create website/landing page
- [ ] Set up business email
- [ ] Register domain
- [ ] Create pricing page
- [ ] Write commercial license template

### Month 1 (After Launch):
- [ ] Monitor for violations
- [ ] Respond to commercial inquiries
- [ ] Consider trademark

### Year 1:
- [ ] Consult lawyer if significant commercial interest
- [ ] Review and update terms based on experience

## 🔍 Enforcement

### How to Enforce BSL:

**If someone violates:**

1. **Friendly Contact** (Day 1)
   ```
   Hi [Name],
   
   We noticed you're using DevSetup Pro at [Company]. That's great!
   
   For companies with 10+ employees, a commercial license is required.
   Can we schedule a call to discuss licensing?
   
   Best,
   DevSetup Team
   ```

2. **Formal Notice** (Day 7 if no response)
   ```
   Subject: DevSetup Pro License Compliance
   
   Dear [Name],
   
   Our records indicate [Company] is using DevSetup Pro in violation
   of the Business Source License 1.1 terms.
   
   Please respond within 14 days to:
   1. Cease use, or
   2. Purchase commercial license
   
   License terms: [link]
   Contact: business@devsetup.pro
   ```

3. **Legal Action** (Last resort)
   - Consult IP lawyer
   - Send cease & desist
   - Consider lawsuit only for major violations

**Reality:** Most companies will comply when contacted. Large companies have compliance teams that will purchase licenses rather than risk legal issues.

## 💡 Pro Tips

1. **Be Nice First**: Most violations are accidental
2. **Focus on Big Fish**: Don't chase small violations
3. **Document Everything**: Keep records of all communications
4. **Automate Detection**: Tools like GitHub's dependency graph can show who's using your code
5. **Make Buying Easy**: Simple pricing, fast response to inquiries

## Questions?

- Legal questions: Consult IP lawyer in your jurisdiction
- BSL specifics: See official BSL FAQ at mariadb.com/bsl-faq-adopting
- Our process: Open GitHub discussion or email hello@devsetup.pro

---

**Next Step**: Run through Phase 1 checklist above!
