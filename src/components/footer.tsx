import Link from 'next/link'
import { Twitter, Linkedin, Youtube } from 'lucide-react'
import config from '@/config.json'
import { DevFestLogo } from './logo'

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 grid grid-cols-3 md:grid-cols-3 gap-8">
            <DevFestLogo className="h-32 w-auto" />
            <div className="grid gap-2 content-start">
              <h3 className="text-sm font-semibold">Navigation</h3>
              {config.navigation.home && <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>}
              {config.navigation.agenda && <Link href="/agenda" className="text-sm text-muted-foreground hover:text-foreground">Agenda</Link>}
              {config.navigation.gallery && <Link href="/gallery" className="text-sm text-muted-foreground hover:text-foreground">Gallery</Link>}
              {config.navigation.volunteer && <Link href="/volunteer" className="text-sm text-muted-foreground hover:text-foreground">Volunteer</Link>}
              {config.navigation.codeOfConduct && <Link href="/code-of-conduct" className="text-sm text-muted-foreground hover:text-foreground">Code of Conduct</Link>}
            </div>
            <div className="grid gap-2 content-start">
              <h3 className="text-sm font-semibold">Social</h3>
              <div className="flex gap-4">
                <a href={config.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
                <a href={config.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </a>
                <a href={config.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Youtube className="h-5 w-5" />
                  <span className="sr-only">YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} DevFest Vizag. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
