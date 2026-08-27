import { NextRequest, NextResponse } from "next/server";

const PAPPERS_API_URL = "https://api.pappers.fr/v2";

export async function GET(request: NextRequest) {
  try {
    const token = process.env.PAPPERS_API_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          error:
            "La variable PAPPERS_API_TOKEN n'est pas configurée.",
        },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        {
          error: "Le paramètre q est obligatoire.",
        },
        { status: 400 }
      );
    }

    const pappersUrl = new URL(
      `${PAPPERS_API_URL}/recherche`
    );

    pappersUrl.searchParams.set("api_token", token);
    pappersUrl.searchParams.set("q", query);
    pappersUrl.searchParams.set("par_page", "10");

    const response = await fetch(pappersUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PAPPERS API ERROR:", data);

      return NextResponse.json(
        {
          error:
            data?.message ??
            data?.error ??
            "Erreur lors de la recherche Pappers.",
        },
        { status: response.status }
      );
    }

    const results =
      data?.resultats ??
      data?.results ??
      [];

    const companies = results.map(
      (company: Record<string, any>) => ({
        siren: company.siren ?? null,

        name:
          company.nom_entreprise ??
          company.nom_complet ??
          company.denomination ??
          null,

        legalName:
          company.nom_entreprise ??
          company.denomination ??
          null,

        legalForm:
          company.forme_juridique ??
          company.forme_juridique_complete ??
          null,

        capital:
          company.capital ?? null,

        siret:
          company.siege?.siret ??
          company.siret ??
          null,

        address:
          company.siege?.adresse_ligne_1 ??
          company.siege?.adresse ??
          company.adresse_ligne_1 ??
          null,

        postalCode:
          company.siege?.code_postal ??
          company.code_postal ??
          null,

        city:
          company.siege?.ville ??
          company.ville ??
          null,

        status:
          company.entreprise_cessee === true
            ? "closed"
            : "active",
      })
    );

    return NextResponse.json({
      companies,
    });
  } catch (error) {
    console.error("PAPPERS SEARCH ERROR:", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la recherche.",
      },
      { status: 500 }
    );
  }
}