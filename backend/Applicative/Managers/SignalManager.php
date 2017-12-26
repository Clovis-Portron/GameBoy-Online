<?php
/**
 * Created by PhpStorm.
 * User: Clovis
 * Date: 31/10/2017
 * Time: 12:34
 */

class SignalManager implements IModelManager
{
    public static function GetAll($filters)
    {
        return ModelManager::GetAll("Signal", $filters);
    }

    public static function Get($id)
    {
        return ModelManager::Get("Signal", $id);
    }

    public static function Put($date, $password = null, $offer = null, $description = null, $candidate = null)
    {
        $item = new Signal(null);
        $item->setDate($date);
        if($password != null)
            $item->setPassword($password);
        if($offer != null)
            $item->setOffer($offer);
        if($description != null)
            $item->setDescription($description);
        if($candidate != null)
            $item->setCandidate($candidate);
        return ModelManager::Put($item);
    }

    public static function Patch($id, $date = null, $password = null, $offer = null, $description = null, $candidate = null)
    {
        $item = new Signal(null);
        if($date != null)
            $item->setDate($date);
        if($password != null)
            $item->setPassword($password);
        if($offer != null)
            $item->setOffer($offer);
        if($description != null)
            $item->setDescription($description);
        if($candidate != null)
            $item->setCandidate($candidate);
        ModelManager::Patch($id, $item);
    }

    public static function Delete( $id)
    {
        ModelManager::Delete("Signal", $id);
    }
}

