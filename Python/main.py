import json

# Fonction pour lire le fichier UMAP
def lire_fichier_umap(nom_fichier):
    with open(nom_fichier, 'r', encoding='utf-8') as fichier:
        return json.load(fichier)

# Fonction pour formater les données
def formater_donnees(input_data):
    features = []

    for layer in input_data.get("layers", []):
        for feature in layer.get("features", []):
            formatted_feature = {
                "type": "Feature",
                "properties": {
                    "nom": feature["properties"]["name"]
                },
                "geometry": {
                    "type": feature["geometry"]["type"],
                    "coordinates": feature["geometry"]["coordinates"]
                }
            }
            features.append(formatted_feature)

    return {
        "type": "FeatureCollection",
        "features": features
    }

# Fonction pour sauvegarder le résultat
def sauvegarder_resultat(nom_fichier, data):
    with open(nom_fichier, 'w', encoding='utf-8') as fichier:
        json.dump(data, fichier, indent=2, ensure_ascii=False)

# Chemin du fichier source
fichier_source = "pays2.umap"

# Lire le fichier source
donnees_umap = lire_fichier_umap(fichier_source)

# Formater les données
donnees_formatees = formater_donnees(donnees_umap)

# Sauvegarder le résultat dans un nouveau fichier
fichier_resultat = "pays.json"
sauvegarder_resultat(fichier_resultat, donnees_formatees)

print(f"Les données ont été formatées et sauvegardées dans {fichier_resultat}")