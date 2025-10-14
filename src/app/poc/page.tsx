import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const pocs = [
  { name: "Karthik", college: "Sanketika Vidya Parishad", contact: "7207957676" },
  { name: "Tina", college: "Gayatri Vidya Parishad Women’s College", contact: "9398946772" }, // Secondary number removed for single tel link
  { name: "Varshitha", college: "Andhra University Women’s College", contact: "9989663099" },
  { name: "Harshal", college: "Gayatri Vidya Parishad College", contact: "8074800413" },
  { name: "Neeraj V", college: "Andhra University", contact: "6302954521" },
  { name: "Harsha V", college: "Raghu Engineering College", contact: "8897485396" },
  { name: "Jathin", college: "Vignan’s Institute", contact: "9515858968" },
  { name: "Mohan", college: "GITAM University", contact: "8008157076" },
];

const formatPhoneNumber = (phone: string) => {
    if (phone.length === 10) {
        return `${phone.substring(0, 5)} ${phone.substring(5)}`;
    }
    return phone;
}

export default function POCPage() {
  return (
    <div className="container mx-auto py-12 px-4 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          List of College POCs
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Get in touch with our points of contact at various colleges for any assistance.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Points of Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>College Name</TableHead>
                  <TableHead>Contact Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pocs.map((poc) => (
                  <TableRow key={poc.name}>
                    <TableCell className="font-medium">{poc.name}</TableCell>
                    <TableCell>{poc.college}</TableCell>
                    <TableCell>
                        <a href={`tel:${poc.contact}`} className="text-primary hover:underline">
                            {formatPhoneNumber(poc.contact)}
                        </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
