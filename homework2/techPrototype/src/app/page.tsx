import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Market Volume</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>20,324,451 MKD</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Market Capitalization</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>20,324,451 MKD</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Most Traded Stock</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>KMB</p>
                </CardContent>
            </Card>
        </div>
    );
}