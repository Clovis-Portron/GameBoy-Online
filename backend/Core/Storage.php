<?php

/**
 * Created by PhpStorm.
 * User: clovis
 * Date: 20/02/17
 * Time: 16:12
 */
abstract class StorageState
{
    const ToInsert = 1;
    const ToUpdate = 2;
    const UpToDate = 0;
    const ToDelete = 3;
}


interface Storage
{
    /**
     * Récupère un object possédant un id dans la base de données
     * @param $object StorageItem initialisé disposant d'un ID prédéfini
     * @return mixed l'objet possédant toutes ses données ou NULL si n'existe pas dans la persistence
     */
    public function find(&$object);

    /**
     * Récupère tout les objects de la table class en lien avec l'instance object et place cette liste dans destination
     * @param $class string en lien avec object dans laquelle chercher des liens
     * @param $object StorageItem depuis lequel chercher des liens
     * @param $destination array dans laquelle sotcker les résultats
     * @param $condition string Condition SQL a appliquer a la requete
     * @return mixed
     */
    public function findAllRelated($class, &$object, &$destination, $condition = "");

    /**
     * Récupère tout les instances de la table class existant dans la persistence
     * @param $class string de la table dans laquelle chercher
     * @param $destination array dans laquelle stocker les résultats
     * @return mixed
     */
    public function findAll($class, &$destination, $condition = "");

    /**
     * Marque un objet à supprimer  dela base de données
     * @param $object StorageItem objet possédnant un id à supprimer de la persistence
     * @return mixed
     */
    public function remove(&$object);

    /**
     * Marque un objet à insérer/mettre à jour dans la base
     * @param $object StorageItem objet entièrement paramétrer à enregistrer dans la persistence
     * @param $state int état de l'objet
     * @return mixed
     */
    public function persist(&$object, $state = StorageState::ToInsert);

    /**
     * Effectue tout les opérations de supression/mise à jour/insertion dans la persistence
     * @return mixed
     */
    public function flush();
}