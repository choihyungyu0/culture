import { Hero } from "@/components/site/hero";
import { Problem } from "@/components/site/problem";
import { Concept } from "@/components/site/concept";
import { Impact } from "@/components/site/impact";
import { DesignDna } from "@/components/site/design-dna";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Problem />
      <Concept />
      <Impact />
      <DesignDna />
    </main>
  );
}
